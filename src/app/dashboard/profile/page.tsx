'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Camera, 
  Phone, 
  FileText, 
  Briefcase, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userEmail, setUserEmail] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState<'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner'>('personal_trainer');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setUserEmail(user.email || '');
        setProfessionalId(user.id);

        const { data: prof, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          setFullName(prof.full_name || user.user_metadata?.full_name || '');
          setSpecialty(prof.specialty || user.user_metadata?.specialty || 'personal_trainer');
          setPhone(prof.phone || user.user_metadata?.phone || '');
          setInstagram(prof.instagram || user.user_metadata?.instagram || '');
          setBio(prof.bio || user.user_metadata?.bio || '');
          setAvatarUrl(prof.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
        } else {
          setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
          setPhone(user.user_metadata?.phone || '');
          setInstagram(user.user_metadata?.instagram || '');
          setBio(user.user_metadata?.bio || '');
          setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
        }
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !professionalId) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    setNotification(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `coach_${professionalId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Atualiza no user_metadata do auth para persistência imediata e segura
      await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          picture: publicUrl,
        },
      });

      // Tenta salvar na tabela professionals (se a coluna existir)
      try {
        await supabase
          .from('professionals')
          .update({ avatar_url: publicUrl } as any)
          .eq('id', professionalId);
      } catch (colErr) {
        console.warn('Coluna avatar_url ainda não migrada na tabela professionals, salvo no auth metadata.');
      }

      setNotification({ type: 'success', text: 'Foto de perfil salva com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao subir foto de perfil:', err);
      setNotification({ type: 'error', text: err.message || 'Não foi possível carregar a imagem.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      // 1. Sempre grava com segurança nos metadados do Auth
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          specialty,
          instagram: instagram.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        },
      });

      // 2. Tenta gravar os campos na tabela professionals com fallback
      const payload: any = {
        id: professionalId,
        full_name: fullName.trim(),
        specialty,
      };

      // Tenta gravar com todos os campos extras
      const { error: fullUpdateError } = await supabase
        .from('professionals')
        .upsert({
          ...payload,
          phone: phone.trim() || null,
          instagram: instagram.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        });

      // Se der erro de coluna ausente na tabela do banco, salva o payload base
      if (fullUpdateError) {
        if (fullUpdateError.code === 'PGRST204' || fullUpdateError.message?.includes('schema cache')) {
          await supabase.from('professionals').upsert(payload);
        } else {
          throw fullUpdateError;
        }
      }

      setNotification({ type: 'success', text: 'Informações do perfil salvas com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      setNotification({ type: 'error', text: err.message || 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500 font-mono text-xs">
        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>CARREGANDO_DADOS_DO_PERFIL...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Top Banner Monocromático */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
              COACH_IDENTITY
            </span>
            <span className="text-xs text-zinc-500 font-mono">ACCOUNT_SETTINGS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Meu Perfil Profissional</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Personalize suas informações públicas, canais de contato e especialidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            <span>ID: {professionalId.substring(0, 8)}...</span>
          </div>
        </div>
      </div>

      {/* Alertas de Notificação */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-zinc-950/80 border-white/40 text-white shadow-lg shadow-white/5'
              : 'bg-zinc-950/80 border-red-500/40 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Avatar e Identidade Visual */}
        <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Camera className="h-4 w-4 text-white" /> Foto de Perfil & Presença
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Sua foto será exibida no topo do painel e na visão dos seus atletas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-2xl bg-zinc-900 border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-xl">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-zinc-500" />
                  )}
                </div>

                <label 
                  htmlFor="coach-avatar-input"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-2xl cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-white mb-1" />
                  <span className="text-[9px] font-mono text-white font-bold uppercase">Trocar</span>
                </label>
                <input
                  id="coach-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <h3 className="text-sm font-bold text-white font-mono">{fullName || 'Coach Arena Fit Pro'}</h3>
                <p className="text-xs text-zinc-400">{userEmail}</p>
                <p className="text-[10px] font-mono text-zinc-500">
                  {uploadingAvatar ? 'Enviando nova foto...' : 'Formatos aceitos: JPG, PNG, WEBP até 5MB.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Informações Básicas e Contato */}
        <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Briefcase className="h-4 w-4 text-white" /> Dados Profissionais & Contato
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Esses dados garantem atendimento rápido e direcionamento dos seus desafios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Nome Completo *
                </label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Especialidade de Atuação
                </label>
                <select
                  value={specialty}
                  onChange={(e: any) => setSpecialty(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 text-white rounded-xl px-3 h-11 text-xs focus:outline-none focus:border-white/40"
                >
                  <option value="personal_trainer">Personal Trainer</option>
                  <option value="nutritionist">Nutricionista</option>
                  <option value="holistic_coach">Coach / Consultor Esportivo</option>
                  <option value="gym_owner">Gestor / Proprietário de Academia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-white" />
                  <span>Telefone / WhatsApp *</span>
                </label>
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Usado para alertas de radar de retenção e resgate de alunos.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                  <svg className="h-3 w-3 text-white fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Instagram Profissional</span>
                </label>
                <Input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@seu.perfil"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-white" />
                <span>Mini Bio / Manifesto do Treinador</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Treinador há mais de 8 anos focado em transformação corporal definitiva, disciplina inabalável e hipertrofia sem atalhos."
                className="w-full bg-black/60 border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-white/40 resize-none font-sans"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar Alterações */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto h-11 px-8 font-mono text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
          >
            {saving ? 'Gravando Alterações...' : 'Salvar Perfil'}
          </Button>
        </div>
      </form>
    </div>
  );
}
