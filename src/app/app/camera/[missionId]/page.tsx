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

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    async function getMission() {
      if (!missionId) return;
      const { data } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();
      setMission(data);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCaptureTime(new Date());
      captureGeolocation();
      setError(null);
    }
  };

  const handleUploadSubmission = async () => {
    if (!selectedFile || !missionId) return;
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const fileExt = selectedFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${missionId}-${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('submissions')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(fileName);

      // Formatar legenda com tempo e timestamp para garantir gravação mesmo sem colunas novas
      let finalCaption = caption.trim() || '';
      if (durationSeconds) {
        const formattedDuration = `${Math.floor(durationSeconds / 60)}min ${durationSeconds % 60}s`;
        finalCaption = finalCaption ? `[TEMPO: ${formattedDuration}] ${finalCaption}` : `[TEMPO: ${formattedDuration}]`;
      }

      const payload: any = {
        mission_id: missionId,
        student_id: user.id,
        photo_url: publicUrl,
        caption: finalCaption || null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        location_name: location?.text || null,
        client_captured_at: captureTime ? captureTime.toISOString() : new Date().toISOString(),
        status: 'approved',
      };

      const { error: dbError } = await supabase
        .from('student_submissions')
        .insert(payload);

      if (dbError) throw dbError;

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
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[3/4] max-h-[60vh] rounded-3xl border border-dashed border-white/20 hover:border-white/50 bg-black/70 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors relative group"
          >
            {/* Mirante Vetorial SVG */}
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
              ACIONAR SENSOR ÓPTICO
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1">
              Toque para abrir a câmera ao vivo com validação instantânea de GPS e carimbo horário.
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
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
                  fileInputRef.current?.click();
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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mono-button-primary w-full h-12 text-xs font-mono font-bold"
          >
            ABRIR CÂMERA DO APARELHO →
          </button>
        )}
      </div>
    </div>
  );
}
