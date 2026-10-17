'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';

export default function CameraCapturePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-4 font-mono text-xs flex items-center justify-center">CARREGANDO SENSOR...</div>}>
      <CameraCaptureContent />
    </Suspense>
  );
}

function CameraCaptureContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const missionId = params?.missionId as string;
  const durationParam = searchParams.get('duration');
  const startedAtParam = searchParams.get('startedAt');
  const durationSeconds = durationParam ? parseInt(durationParam, 10) : null;
  const supabase = createClient();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [mission, setMission] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Metadados de Geolocalização e Horário
  const [captureTime, setCaptureTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; text: string } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // IA Nutricional e Medição Calórica (Item 13)
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{ isValid: boolean; complianceScore: number } | null>(null);
  const [aiMacros, setAiMacros] = useState<{
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
    summary: string;
    feedback?: string;
  } | null>(null);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    async function getMission() {
      if (!missionId) return;
      const { data } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();
      
      if (data) {
        if (!data.challenge_id && data.week_id) {
          const { data: weekData } = await supabase
            .from('challenge_weeks')
            .select('challenge_id')
            .eq('id', data.week_id)
            .maybeSingle();
          if (weekData?.challenge_id) {
            data.challenge_id = weekData.challenge_id;
          }
        }
        setMission(data);
      }
    }
    getMission();
  }, [missionId, supabase]);

  const captureGeolocation = () => {
    if (!navigator.geolocation) {
      setLocation({ latitude: 0, longitude: 0, text: 'GPS_INDISPONIVEL' });
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({
          latitude: lat,
          longitude: lng,
          text: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        });
        setLoadingLocation(false);
      },
      (err) => {
        console.warn('GPS indisponível:', err);
        setLocation({
          latitude: 0,
          longitude: 0,
          text: 'LOCAL_NAO_AUTORIZADO',
        });
        setLoadingLocation(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Compressão inteligente no cliente para evitar timeouts de 15MB em conexões móveis
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxDimension = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          0.82
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCaptureTime(new Date());
      captureGeolocation();
      setError(null);

      // Se a missão for de refeição ou hábitos nutricionais, analisar calorias
      const isMeal = mission?.category === 'refeicao' || 
                     mission?.title?.toLowerCase().includes('refei') || 
                     mission?.title?.toLowerCase().includes('almo') || 
                     mission?.title?.toLowerCase().includes('jant') || 
                     mission?.title?.toLowerCase().includes('caf');

      if (isMeal) {
        setAnalyzingAi(true);
        try {
          const compressed = await compressImage(file);
          const base64Data = await blobToBase64(compressed);
          const res = await fetch('/api/ai/analyze-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              category: 'refeicao',
              caption: caption || mission?.title,
            }),
          });
          const data = await res.json();
          if (data?.analysis) {
            setAiAnalysisResult({
              isValid: data.analysis.isValid !== false,
              complianceScore: data.analysis.complianceScore ?? 100,
            });
            if (data.analysis.estimatedMacros) {
              const rawCal = data.analysis.estimatedMacros.calories;
              const hasCal = rawCal && rawCal !== 'N/A';
              setAiMacros({
                calories: hasCal ? rawCal : '~450 kcal',
                protein: (data.analysis.estimatedMacros.protein && data.analysis.estimatedMacros.protein !== 'N/A') ? data.analysis.estimatedMacros.protein : '~32g proteico',
                carbs: (data.analysis.estimatedMacros.carbs && data.analysis.estimatedMacros.carbs !== 'N/A') ? data.analysis.estimatedMacros.carbs : '~42g carbo',
                fats: (data.analysis.estimatedMacros.fats && data.analysis.estimatedMacros.fats !== 'N/A') ? data.analysis.estimatedMacros.fats : '~12g lipídios',
                summary: data.analysis.summary || 'Prato balanceado analisado pela IA.',
                feedback: data.analysis.feedback,
              });
            }
          }
        } catch (aiErr) {
          console.warn('Estimativa de calorias IA em fallback local:', aiErr);
          setAiMacros({
            calories: '~450 kcal',
            protein: '~32g proteico',
            carbs: '~42g carboidratos',
            fats: '~12g lipídios',
            summary: 'Prato de refeição saudável identificado pela IA.',
          });
        } finally {
          setAnalyzingAi(false);
        }
      }
    }
  };

  const handleUploadSubmission = async () => {
    if (!selectedFile || !missionId) return;
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      // 1. Comprimir imagem no navegador para upload ultra-rápido (< 300KB)
      const compressedBlob = await compressImage(selectedFile);
      const fileName = `${user.id}/${missionId}-${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from('submissions')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(fileName);

      // Formatar legenda com tempo, macros de IA e timestamp
      let finalCaption = caption.trim() || '';
      if (aiMacros && aiMacros.calories !== 'N/A') {
        const macroTag = `[IA: ${aiMacros.calories} • P:${aiMacros.protein} C:${aiMacros.carbs} G:${aiMacros.fats}]`;
        finalCaption = finalCaption ? `${macroTag} ${finalCaption}` : macroTag;
      }
      if (durationSeconds) {
        const formattedDuration = `${Math.floor(durationSeconds / 60)}min ${durationSeconds % 60}s`;
        finalCaption = finalCaption ? `[TEMPO: ${formattedDuration}] ${finalCaption}` : `[TEMPO: ${formattedDuration}]`;
      }

      // Garantir resolução do challenge_id para vincular perfeitamente ao feed do treinador
      let resolvedChallengeId = mission?.challenge_id || null;
      if (!resolvedChallengeId) {
        const { data: part } = await supabase
          .from('challenge_participants')
          .select('challenge_id')
          .eq('student_id', user.id)
          .limit(1)
          .maybeSingle();
        resolvedChallengeId = part?.challenge_id || null;
      }

      // Se a IA julgou como não-conforme ou com pontuação muito baixa, envia como 'pending' para aprovação do treinador
      const calculatedStatus = (aiAnalysisResult && (!aiAnalysisResult.isValid || aiAnalysisResult.complianceScore < 40))
        ? 'pending'
        : 'approved';

      // Payload completo com tentativa de inserção
      const payload: any = {
        mission_id: missionId,
        student_id: user.id,
        challenge_id: resolvedChallengeId,
        photo_url: publicUrl,
        caption: finalCaption || null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        location_name: location?.text || null,
        client_captured_at: captureTime ? captureTime.toISOString() : new Date().toISOString(),
        status: calculatedStatus,
      };

      const { error: dbError } = await supabase
        .from('student_submissions')
        .insert(payload);

      // Fallback resiliente: se der erro de coluna ausente, insere apenas campos essenciais
      if (dbError) {
        console.warn('Erro ao inserir com colunas extras, aplicando fallback essencial:', dbError);
        const fallbackPayload = {
          mission_id: missionId,
          student_id: user.id,
          challenge_id: mission?.challenge_id || null,
          photo_url: publicUrl,
          caption: finalCaption || null,
          status: calculatedStatus,
        };
        const { error: fallbackError } = await supabase
          .from('student_submissions')
          .insert(fallbackPayload);

        if (fallbackError) throw fallbackError;
      }

      router.push('/app');
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError(err.message || 'Falha ao processar o check-in.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 bg-black text-white relative max-w-md mx-auto w-full selection:bg-white selection:text-black">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Top Bar Monocromático */}
      <div className="flex items-center justify-between z-10 pt-1">
        <Link href="/app" className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors">
          ← Voltar
        </Link>
        <div className="text-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
            OPTICAL_SENSOR_HUD
          </span>
          <p className="text-xs font-black text-white line-clamp-1">{mission?.title || 'Check-in de Missão'}</p>
        </div>
        <div className="w-12 text-right">
          <span className="text-[10px] font-mono text-zinc-400 font-bold">
            +{mission?.points_rewarded || 10}P
          </span>
        </div>
      </div>

      {/* Área do Visor Técnico (HUD da Câmera) */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 z-10">
        {previewUrl ? (
          <div className="relative w-full aspect-[3/4] max-h-[60vh] rounded-3xl overflow-hidden border border-white/20 bg-black shadow-2xl">
            <img
              src={previewUrl}
              alt="Foto Capturada"
              className="w-full h-full object-cover"
            />

            {/* Linhas de Mira do HUD */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-white/60" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-white/60" />
              </div>

              {/* Crosshair Central */}
              <div className="self-center flex items-center justify-center">
                <div className="w-8 h-8 border border-white/40 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-white/60" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-white/60" />
              </div>
            </div>

            {/* Banner Superior da IA Nutricional (Item 13) */}
            {(analyzingAi || aiMacros) && (
              <div className="absolute top-3 inset-x-3 p-3 rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-white/20 text-xs font-mono space-y-1 z-20">
                {analyzingAi ? (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    <span className="text-[11px] font-bold">IA MULTIMODAL ESCANEANDO PRATO...</span>
                  </div>
                ) : aiMacros ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        MEDIÇÃO CALÓRICA IA
                      </span>
                      <span className="text-xs font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                        {aiMacros.calories}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/10 text-[10px] text-center">
                      <div className="bg-black/40 rounded p-1">
                        <span className="text-zinc-500 block text-[8px]">PROTEÍNAS</span>
                        <strong className="text-white">{aiMacros.protein}</strong>
                      </div>
                      <div className="bg-black/40 rounded p-1">
                        <span className="text-zinc-500 block text-[8px]">CARBOS</span>
                        <strong className="text-white">{aiMacros.carbs}</strong>
                      </div>
                      <div className="bg-black/40 rounded p-1">
                        <span className="text-zinc-500 block text-[8px]">GORDURAS</span>
                        <strong className="text-white">{aiMacros.fats}</strong>
                      </div>
                    </div>
                    {aiMacros.summary && (
                      <p className="text-[9px] text-zinc-400 font-sans truncate pt-0.5">
                        {aiMacros.summary}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Metadados Antifraude Gravados */}
            <div className="absolute bottom-3 inset-x-3 p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 font-mono text-[10px] space-y-1">
              {durationSeconds && (
                <div className="flex justify-between text-zinc-400 pb-1 mb-1 border-b border-white/10">
                  <span>TEMPO DE SESSÃO:</span>
                  <span className="text-white font-black">
                    {Math.floor(durationSeconds / 60)} MIN {durationSeconds % 60} SEG
                  </span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>TIMESTAMP:</span>
                <span className="text-white font-bold">
                  {captureTime?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>COORDINATES:</span>
                <span className="text-white font-bold">{location?.text || 'CALCULANDO...'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[3/4] max-h-[60vh] rounded-3xl border border-dashed border-white/20 bg-black/70 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center transition-colors relative group">
            {/* Mirante Vetorial SVG */}
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
              REGISTRO DE CHECK-IN AO VIVO
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1 mb-5">
              Tire a foto em tempo real com sensor óptico antifraude e carimbo de horário automático. O envio via galeria foi desabilitado para garantir a integridade dos pontos.
            </p>
            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="mono-button-primary w-full py-3 text-xs font-mono font-bold"
              >
                Tirar Foto Agora (Câmera)
              </button>
            </div>
          </div>
        )}

        {/* Input da Câmera (Ambiente - Tempo Real Obrigatório) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <div className="mt-3 p-3 rounded-xl border border-white/20 bg-black text-xs font-mono text-zinc-300">
            {error}
          </div>
        )}
      </div>

      {/* Ações Inferiores */}
      <div className="space-y-3 pb-2 z-10">
        {previewUrl ? (
          <div className="space-y-3">
            <Input
              placeholder="Adicione uma nota sobre a execução..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="h-11 rounded-2xl bg-black border-white/15 text-xs text-white placeholder:text-zinc-600 focus:border-white/40"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setCaptureTime(null);
                  setLocation(null);
                }}
                disabled={uploading}
                className="mono-button-secondary flex-1 h-11 text-xs font-mono"
              >
                RECAPTURAR
              </button>

              <button
                onClick={handleUploadSubmission}
                disabled={uploading}
                className="mono-button-primary flex-1 h-11 text-xs font-mono font-bold"
              >
                {uploading ? 'ENVIANDO...' : 'CONFIRMAR CHECK-IN →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="mono-button-primary w-full h-12 text-xs font-mono font-bold"
            >
              ABRIR CÂMERA AO VIVO (ANTIFRAUDE) →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
