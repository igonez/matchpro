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
  Sparkles,
  Bell,
  HelpCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { TransformationVaultModal } from '@/components/student/transformation-vault-modal';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { AchievementsGrid } from '@/components/student/achievements-grid';
import { getStudentAchievementsWithProgress, StudentAchievementStatus, DEFAULT_ACHIEVEMENTS } from '@/lib/achievements';

export default function StudentProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [participation, setParticipation] = useState<any>(null);
  const [standing, setStanding] = useState<any>(null);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [achievementsList, setAchievementsList] = useState<StudentAchievementStatus[]>([]);
  const [userPhotos, setUserPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [vaultData, setVaultData] = useState<any>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);

  // Notificações Push
  const [pushEnabled, setPushEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      showToast('Foto de perfil atualizada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar foto de perfil:', err);
      showToast('Não foi possível enviar a foto de perfil: ' + (err.message || 'Tente novamente.'));
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

        setStudent(studentData || { id: user.id, full_name: user.email?.split('@')[0] || 'Atleta' });

        // 2. Desafio Ativo vinculado ao aluno & Inscrição Oficial
        const { data: participantRecord } = await supabase
          .from('challenge_participants')
          .select('challenge_id, payment_status, joined_at, challenges(id, title, is_active, start_date, end_date, price)')
          .eq('student_id', user.id)
          .limit(1)
          .maybeSingle();

        setParticipation(participantRecord || null);
        const ch = (participantRecord?.challenges as any) || null;
        setChallenge(ch);

        // 3. Pontos escopados ao desafio ativo (com fallback caso necessário)
        let standingQuery = supabase
          .from('leaderboard_standings')
          .select('total_points')
          .eq('student_id', user.id);

        if (ch?.id) {
          standingQuery = standingQuery.eq('challenge_id', ch.id);
        }

        const { data: standingData } = await standingQuery.limit(1).maybeSingle();
        setStanding(standingData || { total_points: 0 });

        // 4. Streak Real do Aluno (student_gamification_state)
        let gamifQuery = supabase
          .from('student_gamification_state')
          .select('current_streak')
          .eq('student_id', user.id);

        if (ch?.id) {
          gamifQuery = gamifQuery.eq('challenge_id', ch.id);
        }

        const { data: gamifData } = await gamifQuery.limit(1).maybeSingle();
        setStreakDays(gamifData?.current_streak || 0);

        // 5. Fotos enviadas pelo aluno
        const { data: submissionsData, count } = await supabase
          .from('student_submissions')
          .select('id, photo_url, caption, status, submitted_at, missions(title, category, points_rewarded)', { count: 'exact' })
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false });

        setSubmissionsCount(count || 0);
        setUserPhotos(submissionsData || []);

        let wCount = 0;
        let cCount = 0;
        let mCount = 0;
        (submissionsData || []).forEach((s: any) => {
          if (s.status === 'approved') {
            const cat = s.missions?.category;
            if (cat === 'treino') wCount++;
            if (cat === 'cardio') cCount++;
            if (cat === 'refeicao') mCount++;
          }
        });

        // 6. Ranking atual na turma
        let currentRank = 1;
        if (ch?.id) {
          const { data: allStandings } = await supabase
            .from('leaderboard_standings')
            .select('student_id, total_points')
            .eq('challenge_id', ch.id)
            .order('total_points', { ascending: false });

          if (allStandings && allStandings.length > 0) {
            const idx = allStandings.findIndex((s: any) => s.student_id === user.id);
            currentRank = idx !== -1 ? idx + 1 : allStandings.length + 1;
          }

          // 7. Avaliar Conquistas e Medalhas de Mérito
          const { list, newlyUnlocked } = await getStudentAchievementsWithProgress(
            supabase,
            user.id,
            ch.id,
            {
              streakDays: gamifData?.current_streak || 0,
              totalPoints: standingData?.total_points || 0,
              totalSubmissions: count || 0,
              workoutCount: wCount,
              cardioCount: cCount,
              mealCount: mCount,
              currentRank,
            }
          );

          setAchievementsList(list);
          if (newlyUnlocked.length > 0) {
            showToast(`🏆 Nova conquista: ${newlyUnlocked[0].title}! (+${newlyUnlocked[0].points_reward} XP)`);
          }
        }

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

  // Carregar status de Push notifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPushEnabled(Notification.permission === 'granted');
      }
    }
  }, []);

  const handleTogglePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Notificações não são suportadas neste navegador.');
      return;
    }

    if (pushEnabled) {
      setPushEnabled(false);
      showToast('Notificações no celular silenciadas.');
    } else {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushEnabled(true);
          showToast('Notificações push ativadas com sucesso!');
        } else {
          showToast('Permissão de notificação negada no navegador.');
        }
      } catch (e: any) {
        setPushEnabled(true);
        showToast('Notificações simuladas ativadas!');
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-5 max-w-md mx-auto w-full pb-28 relative">
      <Monochrome3DBackground />

      {/* Header do Perfil */}
      <div className="flex items-center justify-between pt-1 relative z-10">
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
      <Card className="mono-glass-card border border-white/10 p-5 rounded-3xl shadow-xl text-center relative z-10">
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
        <p className="text-xs text-zinc-400 mt-0.5 font-mono">
          {challenge?.title ? `Atleta • ${challenge.title}` : 'Aluno Oficial do Desafio'}
        </p>

        {/* Estatísticas Rápidas em Grid */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-white/10">
          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-white/10">
            <span className="text-[11px] text-zinc-500 block font-mono uppercase">Pontos</span>
            <span className="text-base font-black text-white mt-0.5 block font-mono">
              {standing?.total_points || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-white/10">
            <span className="text-[11px] text-zinc-500 block font-mono uppercase">Ofensiva</span>
            <span className="text-base font-black text-white mt-0.5 block font-mono">
              🔥 {streakDays} {streakDays === 1 ? 'Dia' : 'Dias'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-white/10">
            <span className="text-[11px] text-zinc-500 block font-mono uppercase">Check-ins</span>
            <span className="text-base font-black text-white mt-0.5 block font-mono">
              {submissionsCount}
            </span>
          </div>
        </div>
      </Card>

      {/* MINHA TURMA ATUAL & STATUS DA MATRÍCULA */}
      {challenge && (
        <Card className="mono-glass-card p-4 rounded-3xl border border-white/10 space-y-3 relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Minha Turma Atual
              </span>
            </div>
            {participation?.payment_status === 'paid' ? (
              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                ✓ PAGO & CONFIRMADO
              </Badge>
            ) : participation?.payment_status === 'complimentary' ? (
              <Badge className="bg-white/10 text-white border border-white/20 text-[10px] font-mono">
                ✦ VAGA CORTESIA
              </Badge>
            ) : (
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono">
                ⚠ PAGAMENTO PENDENTE
              </Badge>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-1.5">
            <h4 className="text-sm font-black text-white">{challenge.title}</h4>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
              <span>Período da Turma:</span>
              <span className="text-zinc-200">
                {challenge.start_date ? new Date(challenge.start_date + 'T00:00:00').toLocaleDateString('pt-BR') : '--'} até {challenge.end_date ? new Date(challenge.end_date + 'T00:00:00').toLocaleDateString('pt-BR') : '--'}
              </span>
            </div>
            {participation?.joined_at && (
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Inscrito em:</span>
                <span className="text-zinc-200">
                  {new Date(participation.joined_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 🏅 CONQUISTAS & MEDALHAS DA ARENA (Sistema de Mérito Limpo) */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-300" />
            <span>Conquistas & Medalhas</span>
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            {achievementsList.filter((a) => a.isUnlocked).length}/{achievementsList.length || DEFAULT_ACHIEVEMENTS.length}
          </span>
        </div>

        <AchievementsGrid
          achievements={
            achievementsList.length > 0
              ? achievementsList
              : DEFAULT_ACHIEVEMENTS.map((a) => ({
                  ...a,
                  isUnlocked: false,
                  currentValue: 0,
                  progressPercent: 0,
                }))
          }
        />
      </div>

      {/* FASE 2: COFRE ANTES & DEPOIS COM SLIDER */}
      <div
        onClick={() => setIsVaultModalOpen(true)}
        className="mono-glass-card p-4 rounded-3xl border border-white/15 flex items-center justify-between gap-3 cursor-pointer hover:border-white/30 transition-all group shadow-lg relative z-10"
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

      {/* SEÇÃO DE PREFERÊNCIAS & NOTIFICAÇÕES */}
      <div className="space-y-2.5 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Notificações & Alertas
        </h3>

        {/* Item 18: Mandar Notificação no Celular */}
        <div className="mono-glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white font-mono">Notificações Push no Celular</h4>
                {pushEnabled && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono">
                    ✓ ATIVAS
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Receba lembretes de missões e alertas de risco de perda de ofensiva.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleTogglePush}
            className={`text-xs font-mono font-bold rounded-xl h-8 px-3 ${
              pushEnabled
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {pushEnabled ? 'Silenciar' : 'Ativar Alertas'}
          </Button>
        </div>
      </div>

      {/* SEÇÃO DE LINKS DE SUPORTE E LEGAIS (Itens 20 & 21) */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Suporte & Informações
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/ajuda" className="mono-glass-card p-3.5 rounded-2xl border border-white/10 hover:border-white/25 transition-colors flex items-center gap-2.5">
            <HelpCircle className="h-4 w-4 text-zinc-400" />
            <span className="text-xs text-zinc-300 font-medium font-mono">Central de Ajuda</span>
          </Link>
          <Link href="/termos" className="mono-glass-card p-3.5 rounded-2xl border border-white/10 hover:border-white/25 transition-colors flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-zinc-400" />
            <span className="text-xs text-zinc-300 font-medium font-mono">Termos & Privacidade</span>
          </Link>
        </div>
      </div>

      {/* Histórico de Fotos do Aluno */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Minha Galeria de Missões ({userPhotos.length})
          </h3>
          {userPhotos.length > 0 && (
            <span className="text-[10px] font-mono text-zinc-500">Toque para ampliar</span>
          )}
        </div>

        {userPhotos.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl">
            Nenhuma foto enviada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {userPhotos.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPhoto(item)}
                className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 group text-left focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <img
                  src={item.photo_url}
                  alt="Missão"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                  <span className="text-[10px] font-bold text-white line-clamp-1">
                    {item.missions?.title || 'Check-in'}
                  </span>
                  <span className={`text-[8px] font-black uppercase font-mono tracking-wider ${
                    item.status === 'approved' ? 'text-emerald-400' : item.status === 'rejected' ? 'text-rose-400' : 'text-amber-300'
                  }`}>
                    {item.status === 'approved' ? 'Aprovada' : item.status === 'rejected' ? 'Recusada' : 'Em Análise'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização de Foto da Galeria */}
      <CustomDialog
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.missions?.title || 'Registro de Missão'}
      >
        {selectedPhoto && (
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black max-h-[60vh] flex items-center justify-center">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto?.missions?.title || 'Foto da Missão'}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">
                {selectedPhoto.submitted_at
                  ? new Date(selectedPhoto.submitted_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </span>
              <Badge
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  selectedPhoto.status === 'approved'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : selectedPhoto.status === 'rejected'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {selectedPhoto.status === 'approved'
                  ? 'APROVADA'
                  : selectedPhoto.status === 'rejected'
                  ? 'RECUSADA'
                  : 'EM ANÁLISE'}
              </Badge>
            </div>

            {selectedPhoto.caption && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300">
                {selectedPhoto.caption}
              </div>
            )}
          </div>
        )}
      </CustomDialog>

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

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

