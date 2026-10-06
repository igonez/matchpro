'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Camera, ArrowLeft, Check, RefreshCw, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  // Handler para quando a foto for tirada
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Enviar a foto para o Supabase Storage e criar registro na tabela student_submissions
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

      // 3. Salvar registro na tabela student_submissions com status 'approved' (Auto-Aprovação Imediata)
      const { error: dbError } = await supabase
        .from('student_submissions')
        .insert({
          mission_id: missionId,
          student_id: user.id,
          photo_url: publicUrl,
          caption: caption.trim() || null,
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
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Comprovação</p>
          <p className="text-xs font-black text-white line-clamp-1">{mission?.title || 'Missão Diária'}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Área da Câmera / Preview */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        {previewUrl ? (
          <div className="relative w-full aspect-[3/4] max-h-[65vh] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
            <img
              src={previewUrl}
              alt="Foto Capturada"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-emerald-500/90 text-black text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Foto Capturada
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[3/4] max-h-[65vh] rounded-3xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/60 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors"
          >
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Camera className="h-8 w-8" />
            </div>
            <h3 className="font-extrabold text-base text-white">Toque para abrir a câmera</h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1">
              A captura deve ser feita na hora para validar a foto no desafio.
            </p>
          </div>
        )}

        {/* INPUT OBRIGATÓRIO DE CÂMERA NATIVA */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {/* Input de legenda opcional ao tirar a foto */}
        {previewUrl && (
          <div className="w-full mt-3">
            <input
              type="text"
              placeholder="Adicione uma legenda ou recado para a turma (opcional)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full h-11 px-4 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Controles de Ação */}
      <div className="space-y-2 pb-2">
        {previewUrl ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-2xl h-14"
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
              disabled={uploading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tirar Outra
            </Button>

            <Button
              variant="default"
              size="lg"
              className="flex-1 rounded-2xl h-14 font-extrabold shadow-lg shadow-emerald-500/20"
              onClick={handleUploadSubmission}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Confirmar Envio
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full rounded-2xl h-14 font-extrabold text-base shadow-xl shadow-emerald-500/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 mr-2" />
            Abrir Câmera do Aparelho
          </Button>
        )}
      </div>
    </div>
  );
}
