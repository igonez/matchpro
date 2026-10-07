'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Camera, 
  Sparkles, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  UploadCloud, 
  CheckCircle2, 
  Scale, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  challengeId: string;
  studentName: string;
  vaultData: any;
  onVaultUpdated: () => void;
}

export function TransformationVaultModal({
  isOpen,
  onClose,
  studentId,
  challengeId,
  studentName,
  vaultData,
  onVaultUpdated,
}: VaultModalProps) {
  const supabase = createClient();

  const [sliderPosition, setSliderPosition] = useState(50); // % de corte no antes & depois
  const [activeTab, setActiveTab] = useState<'view' | 'upload_before' | 'upload_after'>('view');
  
  // Upload states
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUploadSubmit = async (type: 'before' | 'after') => {
    if (!file) return;
    setUploading(true);

    try {
      // 1. Upload da foto no storage (bucket submissions)
      const fileExt = file.name.split('.').pop();
      const fileName = `vault_${studentId}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `vault/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      // 2. Gravar no student_transformation_vault
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      if (type === 'before') {
        updatePayload.before_photo_url = publicUrl;
        updatePayload.before_weight_kg = weight ? Number(weight) : null;
        updatePayload.before_notes = notes;
        updatePayload.before_submitted_at = new Date().toISOString();
      } else {
        updatePayload.after_photo_url = publicUrl;
        updatePayload.after_weight_kg = weight ? Number(weight) : null;
        updatePayload.after_notes = notes;
        updatePayload.after_submitted_at = new Date().toISOString();
        updatePayload.is_completed = true;
        updatePayload.is_revealed = true;
      }

      if (vaultData?.id) {
        await supabase
          .from('student_transformation_vault')
          .update(updatePayload)
          .eq('id', vaultData.id);
      } else {
        await supabase
          .from('student_transformation_vault')
          .insert({
            student_id: studentId,
            challenge_id: challengeId,
            ...updatePayload,
          });
      }

      setFile(null);
      setPreviewUrl(null);
      setWeight('');
      setNotes('');
      setActiveTab('view');
      onVaultUpdated();
    } catch (err) {
      console.error('Erro no upload da foto do cofre:', err);
      alert('Não foi possível enviar a foto. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const hasBefore = !!vaultData?.before_photo_url;
  const hasAfter = !!vaultData?.after_photo_url;
  const isUnlocked = hasBefore && hasAfter;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-5 text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Glow de fundo */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/5 text-white border border-white/10 flex items-center justify-center">
              {isUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                Transformação Blindada
              </span>
              <h3 className="text-base font-black text-white leading-tight">Cofre Antes & Depois</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white h-8 px-2"
          >
            Fechar
          </Button>
        </div>

        {/* CONTEÚDO PRINCIPAL: VIEW OU UPLOADS */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {activeTab === 'view' && (
            <>
              {/* SLIDER DE ANTES & DEPOIS (SE AMBAS AS FOTOS EXISTIREM) */}
              {isUnlocked ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 bg-black select-none shadow-xl">
                    {/* Imagem "DEPOIS" (Fundo total) */}
                    <img
                      src={vaultData.after_photo_url}
                      alt="Depois"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white text-black text-[10px] font-black uppercase shadow font-mono">
                      Depois (Dia 30)
                    </div>

                    {/* Imagem "ANTES" (Cortada pelo slider) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={vaultData.before_photo_url}
                        alt="Antes"
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-zinc-950/90 text-white text-[10px] font-black uppercase border border-white/20 shadow font-mono">
                        Antes (Dia 1)
                      </div>
                    </div>

                    {/* Divisor Visual do Slider */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none flex items-center justify-center"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="h-7 w-7 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg font-bold text-xs -ml-3.5">
                        ↔
                      </div>
                    </div>

                    {/* Input range invisível cobrindo tudo para arrastar */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />
                  </div>

                  <p className="text-[11px] text-zinc-400 text-center">
                    Arraste o slider para o lado para comparar a evolução.
                  </p>

                  {/* Card Estatísticas da Transformação */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 grid grid-cols-2 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Peso Inicial</span>
                      <p className="text-sm font-black text-white mt-0.5 font-mono">
                        {vaultData.before_weight_kg ? `${vaultData.before_weight_kg} kg` : 'Registrado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Peso Final</span>
                      <p className="text-sm font-black text-white mt-0.5 font-mono">
                        {vaultData.after_weight_kg ? `${vaultData.after_weight_kg} kg` : 'Concluído'}
                      </p>
                    </div>
                  </div>

                  {/* Botão de Compartilhar nos Stories */}
                  <Button
                    onClick={() => {
                      alert('Story pronto para exportação.');
                    }}
                    className="w-full h-11 rounded-xl text-xs font-black bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar nos Stories
                  </Button>
                </div>
              ) : (
                /* ESTADO TRANCADO OU PARCIAL */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 text-xs text-zinc-300 space-y-2">
                    <p className="font-bold text-white flex items-center gap-2">
                      <Lock className="h-4 w-4 text-white" />
                      Privacidade Absoluta Garantida:
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Sua foto do <strong className="text-white">Dia 1</strong> não vai para o feed público e ninguem tem acesso. Ela fica protegida em cofre privado até o último dia, quando você enviar a foto final e liberar a visualizacao comparativa.
                    </p>
                  </div>

                  {/* Grid de status das duas fotos */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Foto Dia 1 */}
                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-center space-y-2.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                        Foto 1 • Dia 1
                      </div>
                      {hasBefore ? (
                        <div className="space-y-1.5">
                          <div className="h-20 w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-900 relative">
                            <img src={vaultData.before_photo_url} alt="Antes" className="w-full h-full object-cover blur-sm" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Lock className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-300 block font-mono">Trancada no Cofre</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('upload_before')}
                          className="w-full h-9 rounded-xl text-[11px] font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20"
                        >
                          Tirar Foto 1
                        </Button>
                      )}
                    </div>

                    {/* Foto Dia 30 */}
                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-center space-y-2.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                        Foto 2 • Dia 30
                      </div>
                      {hasAfter ? (
                        <span className="text-[10px] font-bold text-white block pt-4 font-mono">Concluída</span>
                      ) : hasBefore ? (
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('upload_after')}
                          className="w-full h-9 rounded-xl text-[11px] font-black bg-white hover:bg-zinc-200 text-black shadow-md shadow-white/5"
                        >
                          Enviar Foto 2
                        </Button>
                      ) : (
                        <div className="py-3 text-[10px] text-zinc-500 font-bold uppercase font-mono">
                          Aguardando Dia 1
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* FORMULÁRIO DE ENVIO (BEFORE OU AFTER) */}
          {(activeTab === 'upload_before' || activeTab === 'upload_after') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white font-mono">
                  {activeTab === 'upload_before' ? 'Foto de Início (Dia 1)' : 'Foto de Conclusão (Dia 30)'}
                </span>
                <button
                  onClick={() => {
                    setActiveTab('view');
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              {/* Upload Dropzone / Câmera */}
              <div className="relative aspect-[4/5] rounded-2xl border-2 border-dashed border-white/20 bg-zinc-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 text-white flex items-center justify-center border border-white/10">
                      <Camera className="h-6 w-6 stroke-[2]" />
                    </div>
                    <span className="text-xs font-bold text-white">Toque para Abrir Câmera</span>
                    <span className="text-[10px] text-zinc-500">Tire de frente com boa iluminação</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Peso Atual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 78.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-white/10 text-white px-3 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Observações</label>
                  <input
                    type="text"
                    placeholder="Ex: Em jejum pela manhã"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-white/10 text-white px-3 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <Button
                onClick={() => handleUploadSubmit(activeTab === 'upload_before' ? 'before' : 'after')}
                disabled={!file || uploading}
                className="w-full h-11 rounded-xl text-xs font-black bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 disabled:opacity-40"
              >
                {uploading ? 'Salvando Foto...' : 'Salvar no Cofre'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
