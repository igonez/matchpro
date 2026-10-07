'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Camera, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Upload, 
  AlertCircle, 
  ShieldCheck,
  MapPin,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export default function CameraCapturePage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params?.missionId as string;
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

  // Buscar detalhes da missão
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

  // Capturar GPS no momento em que a foto é tirada
  const captureGeolocation = () => {
    if (!navigator.geolocation) {
      setLocation({ latitude: 0, longitude: 0, text: 'GPS não suportado' });
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
          text: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        });
        setLoadingLocation(false);
      },
      (err) => {
        console.warn('Erro ao obter GPS:', err);
        setLocation({
          latitude: 0,
          longitude: 0,
          text: 'Localização não autorizada',
        });
        setLoadingLocation(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handler para quando a foto for tirada
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

  // Enviar a foto para o Supabase Storage e salvar submissão com geolocalização e comentário
  const handleUploadSubmission = async () => {
    if (!selectedFile || !missionId) return;
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      // 1. Upload do arquivo para o bucket 'submissions'
      const fileExt = selectedFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${missionId}-${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('submissions')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (storageError) throw storageError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(fileName);

      // 3. Salvar registro na tabela student_submissions com status 'approved'
      const { error: dbError } = await supabase
        .from('student_submissions')
        .insert({
          mission_id: missionId,
          student_id: user.id,
          photo_url: publicUrl,
          caption: caption.trim() || null,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          location_name: location?.text || null,
          client_captured_at: captureTime ? captureTime.toISOString() : new Date().toISOString(),
          status: 'approved',
        });

      if (dbError) throw dbError;

      // 4. Retornar ao feed com status atualizado
      router.push('/app');
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError(err.message || 'Falha ao enviar a foto da missão.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 bg-black text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/app">
          <Button variant="ghost" size="icon" className="rounded-full bg-zinc-900/60 backdrop-blur">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="text-center">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Câmera Oficial ArenaPro</p>
          <p className="text-xs font-black text-white line-clamp-1">{mission?.title || 'Missão Diária'}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Área da Câmera / Preview */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        {previewUrl ? (
          <div className="relative w-full aspect-[3/4] max-h-[60vh] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
            <img
              src={previewUrl}
              alt="Foto Capturada"
              className="w-full h-full object-cover"
            />

            {/* Badges de Metadados Antifraude Impressos na Foto */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <div className="bg-emerald-500/90 text-black text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <ShieldCheck className="h-3.5 w-3.5" /> Antifraude Ativo
              </div>

              {captureTime && (
                <div className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10">
                  <Clock className="h-3 w-3 text-emerald-400" />
                  {captureTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              )}

              {location && (
                <div className="bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10">
                  <MapPin className="h-3 w-3 text-cyan-400" />
                  {location.text}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[3/4] max-h-[60vh] rounded-3xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/60 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors"
          >
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Camera className="h-8 w-8" />
            </div>
            <h3 className="font-extrabold text-base text-white">Toque para abrir a câmera</h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1">
              A captura deve ser feita na hora com geolocalização e carimbo de horário antifraude.
            </p>
          </div>
        )}

        {/* Input Oculto de Câmera com capture="environment" */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <div className="flex items-center gap-2 mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Barra de Ações Inferior com Campo de Comentário */}
      <div className="space-y-3 pb-2">
        {previewUrl ? (
          <div className="space-y-3">
            {/* Campo de Legenda / Comentário para o Feed */}
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-zinc-500">
                <MessageSquare className="h-4 w-4" />
              </div>
              <Input
                placeholder="Adicione um comentário ou legenda para o Feed..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="pl-10 h-11 rounded-2xl bg-zinc-900 border-zinc-800 text-xs text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setCaptureTime(null);
                  setLocation(null);
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
                className="flex-1 rounded-2xl border-zinc-800 bg-zinc-900/60 text-xs font-bold"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" /> Tirar Outra
              </Button>

              <Button
                size="lg"
                onClick={handleUploadSubmission}
                disabled={uploading}
                className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/25"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1.5" /> Enviar e Pontuar
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-lg shadow-emerald-500/25 h-12"
          >
            <Camera className="h-5 w-5 mr-2" /> Abrir Câmera do Dispositivo
          </Button>
        )}
      </div>
    </div>
  );
}
