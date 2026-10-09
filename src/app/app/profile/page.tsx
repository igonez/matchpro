'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Trophy, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  LogOut, 
  Camera, 
  ShieldCheck, 
  Award,
  ChevronRight,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { TransformationVaultModal } from '@/components/student/transformation-vault-modal';

export default function StudentProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [standing, setStanding] = useState<any>(null);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [userPhotos, setUserPhotos] = useState<any[]>([]);
  const [vaultData, setVaultData] = useState<any>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !student?.id) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${student.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', student.id);

      if (updateError) throw updateError;

      setStudent((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      alert('Foto de perfil atualizada com sucesso.');
    } catch (err: any) {
      console.error('Erro ao atualizar foto de perfil:', err);
      alert('Não foi possível enviar a foto de perfil: ' + (err.message || 'Tente novamente.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 1. Dados do aluno
        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        setStudent(studentData || { full_name: user.email?.split('@')[0] || 'Atleta' });

        // 2. Pontos
        const { data: standingData } = await supabase
          .from('leaderboard_standings')
          .select('total_points')
          .eq('student_id', user.id)
          .limit(1)
          .single();

        setStanding(standingData);

        // 3. Fotos enviadas
        const { data: submissionsData, count } = await supabase
          .from('student_submissions')
          .select('id, photo_url, status, submitted_at, missions(title)', { count: 'exact' })
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false });

        setSubmissionsCount(count || 0);
        setUserPhotos(submissionsData || []);

        // 4. Desafio Ativo & Cofre Antes/Depois
        const { data: ch } = await supabase
          .from('challenges')
          .select('id, title')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        setChallenge(ch);

        if (ch) {
          const { data: vault } = await supabase
            .from('student_transformation_vault')
            .select('*')
            .eq('student_id', user.id)
            .eq('challenge_id', ch.id)
            .maybeSingle();

          setVaultData(vault);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-5">
      {/* Header do Perfil */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-black text-white tracking-tight">Meu Perfil</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-xs text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4 mr-1.5" /> Sair
        </Button>
      </div>

      {/* Card Principal do Usuário */}
      <Card className="border border-white/10 bg-zinc-900/60 p-5 rounded-3xl shadow-xl text-center">
        {/* Avatar com upload de foto */}
        <div className="relative mx-auto w-24 h-24 rounded-full border border-white/20 p-1 bg-white/5 shadow-xl shadow-black mb-3 group">
          <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center font-black text-2xl text-white overflow-hidden relative">
            {student?.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.full_name || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              student?.full_name?.charAt(0) || 'A'
            )}

            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Botão de Câmera / Upload */}
          <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white hover:bg-zinc-200 border-2 border-zinc-950 flex items-center justify-center text-black cursor-pointer shadow-md transition-all active:scale-95" title="Alterar foto de perfil">
            <Camera className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
              className="hidden"
            />
          </label>
        </div>

        <h2 className="text-lg font-black text-white tracking-tight">{student?.full_name || 'Atleta ArenaFitPro'}</h2>
        <p className="text-xs text-zinc-400 mt-0.5 font-mono">Aluno Oficial do Desafio</p>

        {/* Estatísticas Rápidas em Grid */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-white/10">
          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-white/10">
            <span className="text-[11px] text-zinc-500 block font-mono uppercase">Pontos</span>
            <span className="text-base font-black text-white mt-0.5 block font-mono">
              {standing?.total_points || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-white/10">
            <span className="text-[11px] text-zinc-500 block font-mono uppercase">Streak</span>
            <span className="text-base font-black text-white mt-0.5 block font-mono">
              3 Dias
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-white/10">
            <span className="text-[11px] text-zinc-500 block font-mono uppercase">Fotos</span>
            <span className="text-base font-black text-white mt-0.5 block font-mono">
              {submissionsCount}
            </span>
          </div>
        </div>
      </Card>

      {/* FASE 2: COFRE ANTES & DEPOIS COM SLIDER */}
      <div
        onClick={() => setIsVaultModalOpen(true)}
        className="p-4 rounded-3xl bg-zinc-900/60 border border-white/15 flex items-center justify-between gap-3 cursor-pointer hover:border-white/30 transition-all group shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/5 text-white border border-white/10 flex items-center justify-center shrink-0">
            {vaultData?.is_completed ? (
              <Unlock className="h-6 w-6 stroke-[2]" />
            ) : (
              <Lock className="h-6 w-6 stroke-[2]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                {vaultData?.is_completed ? 'Desbloqueado' : 'Privado & Seguro'}
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-600" />
              <span className="text-[10px] text-zinc-400 font-semibold font-mono">Dia 1 ao 30</span>
            </div>
            <h4 className="text-xs font-black text-white group-hover:text-zinc-200 transition-colors">
              Cofre Antes & Depois
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {vaultData?.is_completed
                ? 'Arraste o slider e veja sua evolução comparativa.'
                : vaultData?.before_photo_url
                ? 'Foto do Dia 1 armazenada. Envie a foto final no Dia 30.'
                : 'Envie sua foto do Dia 1 para guardar no cofre privado.'}
            </p>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
      </div>

      {/* Histórico de Fotos do Aluno */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Minha Galeria de Missões ({userPhotos.length})
        </h3>

        {userPhotos.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl">
            Nenhuma foto enviada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {userPhotos.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 group"
              >
                <img
                  src={item.photo_url}
                  alt="Missão"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-[10px] font-bold text-white line-clamp-1">
                    {item.missions?.title}
                  </span>
                  <span className={`text-[9px] font-black uppercase mt-1 font-mono ${
                    item.status === 'approved' ? 'text-white' : item.status === 'rejected' ? 'text-zinc-500' : 'text-zinc-300'
                  }`}>
                    {item.status === 'approved' ? 'Aprovada' : item.status === 'rejected' ? 'Recusada' : 'Em Análise'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL COFRE ANTES & DEPOIS */}
      {student && challenge && (
        <TransformationVaultModal
          isOpen={isVaultModalOpen}
          onClose={() => setIsVaultModalOpen(false)}
          studentId={student.id}
          challengeId={challenge.id}
          studentName={student.full_name || 'Atleta'}
          vaultData={vaultData}
          onVaultUpdated={async () => {
            const { data: v } = await supabase
              .from('student_transformation_vault')
              .select('*')
              .eq('student_id', student.id)
              .eq('challenge_id', challenge.id)
              .maybeSingle();
            setVaultData(v);
          }}
        />
      )}
    </div>
  );
}

