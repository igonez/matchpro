'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Input } from '@/components/ui/input';

export default function DashboardOverviewPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalRevenue: 0,
    pendingSubmissions: 0,
    activeChallenges: 0,
  });
  const [challenges, setChallenges] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

  // Modal Customizado de Publicar Aviso (Substitui o prompt() nativo)
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeIsPinned, setNoticeIsPinned] = useState(true);
  const [submittingNotice, setSubmittingNotice] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de Convite & Compartilhamento
  const [inviteModalChallenge, setInviteModalChallenge] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleChallengeStatus = async (challengeId: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from('challenges')
        .update({ is_active: nextStatus })
        .eq('id', challengeId);

      if (error) throw error;

      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, is_active: nextStatus } : c))
      );
      showToast(nextStatus ? 'Turma ativada com sucesso!' : 'Turma encerrada/pausada.');
    } catch (err: any) {
      showToast('Erro ao alterar status: ' + err.message);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // 1. Desafios EXCLUSIVOS do profissional autenticado (Isolamento Multi-Tenant)
        const { data: challengesData } = await supabase
          .from('challenges')
          .select('*, missions(*)')
          .eq('professional_id', user.id)
          .order('start_date', { ascending: false });

        const safeChallenges = challengesData || [];
        setChallenges(safeChallenges);

        if (safeChallenges.length === 0) {
          setStats({
            activeStudents: 0,
            totalRevenue: 0,
            pendingSubmissions: 0,
            activeChallenges: 0,
          });
          setAtRiskStudents([]);
          setLoading(false);
          return;
        }

        const coachChallengeIds = safeChallenges.map((c: any) => c.id);

        // 2. Participantes exclusivos das turmas do treinador
        const { data: participantsData } = await supabase
          .from('challenge_participants')
          .select('id, challenge_id')
          .in('challenge_id', coachChallengeIds);

        const participantsList = participantsData || [];

        // 3. Submissões pendentes de auditoria exclusivas das turmas do treinador
        const { count: pendingCount } = await supabase
          .from('student_submissions')
          .select('id, missions!inner(challenge_id)', { count: 'exact', head: true })
          .eq('status', 'pending')
          .in('missions.challenge_id', coachChallengeIds);

        // 4. Calcular faturamento consolidado real (participantes x valor de cada turma)
        const priceMap = new Map<string, number>();
        safeChallenges.forEach((c: any) => {
          priceMap.set(c.id, Number(c.price) || 0);
        });

        const calculatedRevenue = participantsList.reduce((acc: number, curr: any) => {
          return acc + (priceMap.get(curr.challenge_id) || 0);
        }, 0);

        setStats({
          activeStudents: participantsList.length,
          totalRevenue: calculatedRevenue,
          pendingSubmissions: pendingCount || 0,
          activeChallenges: safeChallenges.filter((c: any) => c.is_active).length,
        });

        // 5. Radar de Alunos em Risco (Inativos) nas turmas do treinador
        const { data: atRiskData } = await supabase
          .from('at_risk_students_view')
          .select('*')
          .in('challenge_id', coachChallengeIds)
          .gte('days_inactive', 2)
          .order('days_inactive', { ascending: false })
          .limit(5);

        setAtRiskStudents(atRiskData || []);

      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  const handlePublishAnnouncement = async () => {
    if (challenges.length === 0) {
      showToast('Crie um desafio antes de publicar avisos.');
      return;
    }
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      showToast('Preencha o título e o conteúdo do comunicado.');
      return;
    }

    setSubmittingNotice(true);
    try {
      const { error } = await supabase.from('challenge_announcements').insert({
        challenge_id: challenges[0].id,
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        is_pinned: noticeIsPinned,
      });

      if (error) throw error;

      setIsNoticeModalOpen(false);
      setNoticeTitle('');
      setNoticeContent('');
      showToast('Aviso publicado no Mural dos Alunos com sucesso.');
    } catch (err: any) {
      showToast('Erro ao publicar aviso: ' + err.message);
    } finally {
      setSubmittingNotice(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Toast Flutuante Customizado */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Banner Monocromático */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
              TERMINAL_OVERVIEW
            </span>
            <span className="text-xs text-zinc-500 font-mono">LIVE_DATABASE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Operação dos Desafios</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Métricas em tempo real, fila de auditoria e radar de retenção ativa.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Link href="/dashboard/audit" className="w-full sm:w-auto">
            <button className="mono-button-primary w-full sm:w-auto px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 font-mono">
              Auditar Fotos ({stats.pendingSubmissions})
            </button>
          </Link>

          {/* Botão que abre o modal customizado (Zero prompt nativo) */}
          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="mono-button-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-mono"
          >
            Publicar Aviso
          </button>

          <Link href="/dashboard/challenges/new" className="w-full sm:w-auto">
            <button className="mono-button-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-mono">
              + Novo Desafio
            </button>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principais com 3D Spotlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Card 1: Alunos Ativos */}
        <Link href="/dashboard/students" className="block group">
          <SpotlightCard3D className="p-5 group-hover:border-white/30 transition-all cursor-pointer">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 group-hover:text-white transition-colors">
                ALUNOS_INSCRITOS →
              </span>
              <span className="h-2 w-2 rounded-full bg-white" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{stats.activeStudents}</div>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">Inscritos nas turmas ativas</p>
          </SpotlightCard3D>
        </Link>

        {/* Card 2: Faturamento */}
        <Link href="/dashboard/students" className="block group">
          <SpotlightCard3D className="p-5 group-hover:border-white/30 transition-all cursor-pointer">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 group-hover:text-white transition-colors">
                FATURAMENTO_TOTAL →
              </span>
              <span className="text-[10px] font-mono text-zinc-400">BRL</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">Valor consolidado das inscrições</p>
          </SpotlightCard3D>
        </Link>

        {/* Card 3: Auditoria Pendente */}
        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              FILA_DE_SWIPE
            </span>
            <span className="text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded-full">
              PENDENTE
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.pendingSubmissions}</div>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">Check-ins aguardando revisão</p>
        </SpotlightCard3D>

        {/* Card 4: Desafios Criados */}
        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              DESAFIOS_TOTAIS
            </span>
            <span className="text-[10px] font-mono text-zinc-400">ATIVOS: {stats.activeChallenges}</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{challenges.length}</div>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">Turmas configuradas na plataforma</p>
        </SpotlightCard3D>
      </div>

      {/* RADAR ANTI-DESISTÊNCIA (ALUNOS INATIVOS +48H) */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white font-mono tracking-tight flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              RADAR_ANTI_DESISTENCIA (INATIVOS +48H)
            </h2>
            <p className="text-xs text-zinc-400">
              Alunos que precisam de resgate via WhatsApp antes de abandonarem a rotina.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-white border border-white/20 px-2.5 py-0.5 rounded-full">
            {atRiskStudents.length} ALERTAS
          </span>
        </div>

        {atRiskStudents.length === 0 ? (
          <div className="mono-glass-card p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white font-mono">100% DE RETENÇÃO NA TURMA</p>
              <p className="text-[11px] text-zinc-400">Nenhum aluno está inativo há mais de 48 horas.</p>
            </div>
            <span className="text-xs font-mono text-white">NORMAL</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {atRiskStudents.map((item) => {
              const studentFirstName = item.student_name?.split(' ')[0] || 'Atleta';
              const cleanPhone = item.student_phone?.replace(/\D/g, '') || '';
              const targetPhone = cleanPhone
                ? cleanPhone.startsWith('55') && cleanPhone.length >= 12
                  ? cleanPhone
                  : `55${cleanPhone}`
                : '';
              const message = encodeURIComponent(
                `Fala ${studentFirstName}! Notei que você está ausente do desafio nesses últimos dias. Está tudo bem por aí? Sua equipe e eu estamos aguardando você, vamos voltar com tudo hoje!`
              );
              const waLink = targetPhone ? `https://wa.me/${targetPhone}?text=${message}` : null;

              return (
                <div
                  key={item.student_id}
                  className="mono-glass-card p-4 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full">
                        {item.days_inactive} DIAS SEM FOTO
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{item.challenge_title}</span>
                    </div>

                    <h4 className="text-sm font-black text-white">{item.student_name}</h4>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      Última foto: {new Date(item.last_activity_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono-button-primary w-full h-8 text-xs flex items-center justify-center font-mono"
                      >
                        RESGATAR NO WHATSAPP →
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(decodeURIComponent(message));
                          showToast('Mensagem de resgate copiada com sucesso!');
                        }}
                        className="mono-button-secondary w-full h-8 text-xs font-mono"
                      >
                        COPIAR TEXTO DE RESGATE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista de Desafios Recentes Monocromática */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white font-mono tracking-tight">
            TURMAS_EM_ANDAMENTO
          </h2>
          <Link href="/dashboard/missions" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            Gerenciar Missões →
          </Link>
        </div>

        {challenges.length === 0 && !loading ? (
          <div className="mono-glass-card p-8 rounded-3xl text-center border-dashed">
            <p className="font-bold text-white text-sm font-mono">NENHUM DESAFIO CRIADO AINDA</p>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Crie seu primeiro desafio para cadastrar missões e convidar alunos.
            </p>
            <Link href="/dashboard/challenges/new">
              <button className="mono-button-primary px-5 py-2 text-xs">
                Criar Desafio
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((c) => (
              <div key={c.id} className="mono-glass-card p-5 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => handleToggleChallengeStatus(c.id, c.is_active)}
                      title="Clique para alternar status da turma"
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition-all ${
                        c.is_active
                          ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                          : 'border-white/10 bg-black text-zinc-500 hover:text-white'
                      }`}
                    >
                      {c.is_active ? '● ATIVO' : '○ ENCERRADO'}
                    </button>
                    <span className="text-xs font-mono font-black text-white">
                      R$ {Number(c.price).toFixed(2)}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 mt-1">
                    {new Date(c.start_date).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(c.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
                    <span>Missões ativas:</span>
                    <span className="font-bold text-white">{c.missions?.length || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/missions?challengeId=${c.id}`} className="flex-1">
                      <button className="mono-button-secondary w-full py-1.5 text-xs font-mono">
                        Missões
                      </button>
                    </Link>
                    <Link href={`/dashboard/challenges/${c.id}/edit`}>
                      <button className="mono-button-secondary px-3 py-1.5 text-xs font-mono">
                        Editar
                      </button>
                    </Link>
                    <button
                      onClick={() => setInviteModalChallenge(c)}
                      className="mono-button-primary px-3 py-1.5 text-xs font-mono"
                      title="Abrir central de convite"
                    >
                      Convite
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CUSTOMIZADO DE PUBLICAR AVISO (Substituição definitiva do prompt nativo) */}
      <CustomDialog
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="Publicar Comunicado no Mural"
        description="Esta mensagem será exibida com destaque imediato no aplicativo de todos os seus alunos."
        confirmLabel="Publicar Aviso"
        cancelLabel="Cancelar"
        onConfirm={handlePublishAnnouncement}
        isLoading={submittingNotice}
      >
        <div className="space-y-3.5">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Título do Aviso
            </label>
            <Input
              placeholder="Ex: Treino Extra de Sábado às 08h"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              className="bg-black/80 border-white/15 text-white rounded-xl text-xs h-10 focus:border-white/40"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Mensagem / Comunicado
            </label>
            <textarea
              placeholder="Digite o comunicado oficial para a turma..."
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              rows={4}
              className="w-full bg-black/80 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/40 font-sans"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={noticeIsPinned}
              onChange={(e) => setNoticeIsPinned(e.target.checked)}
              className="rounded bg-black border-white/20 text-white focus:ring-0"
            />
            <span className="text-xs font-mono text-zinc-400">
              Fixar este aviso no topo do mural dos alunos
            </span>
          </label>
        </div>
      </CustomDialog>

      {/* MODAL DE CONVITE & COMPARTILHAMENTO DO DESAFIO */}
      {inviteModalChallenge && (
        <CustomDialog
          isOpen={!!inviteModalChallenge}
          onClose={() => setInviteModalChallenge(null)}
          title={`Convidar Alunos • ${inviteModalChallenge.title}`}
          description="Compartilhe este link exclusivo com seus alunos para que eles entrem no desafio."
          confirmLabel="Fechar"
          onConfirm={() => setInviteModalChallenge(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Link Público do Desafio
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteModalChallenge.id}` : ''}
                  className="bg-black/80 border-white/15 text-white rounded-xl text-xs font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}/join/${inviteModalChallenge.id}`;
                    navigator.clipboard.writeText(link);
                    showToast('Link do convite copiado!');
                  }}
                  className="mono-button-primary px-3 text-xs shrink-0 font-mono"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/10 bg-zinc-900/40 space-y-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Disparo Rápido no WhatsApp
              </span>
              <p className="text-xs text-zinc-300">
                Envie o convite formatado direto nos seus grupos ou no privado de cada atleta:
              </p>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Fala atleta! As inscrições para o *${inviteModalChallenge.title}* estão oficialmente abertas na plataforma ArenaFitPro. Acesse o link abaixo e garanta sua vaga agora:\n\n${typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteModalChallenge.id}` : ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-button-secondary w-full py-2 text-xs flex items-center justify-center gap-2 font-mono"
              >
                Compartilhar no WhatsApp →
              </a>
            </div>

            {/* QR Code Monocromático para Stories / Balcão */}
            <div className="p-3.5 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                QR CODE • STORIES & BALCÃO DA ACADEMIA
              </span>
              <div className="p-2 bg-black border border-white/20 rounded-2xl shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteModalChallenge.id}` : ''
                  )}&bgcolor=000000&color=ffffff&margin=10`}
                  alt="QR Code do Desafio"
                  className="w-36 h-36 rounded-lg invert brightness-125 contrast-125"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Peça para o aluno apontar a câmera do celular para entrar na hora.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-white/[0.06]">
              <span>Inscrição: R$ {Number(inviteModalChallenge.price).toFixed(2)}</span>
              <span>Status: {inviteModalChallenge.is_active ? 'Turma Aberta' : 'Encerrada'}</span>
            </div>
          </div>
        </CustomDialog>
      )}
    </div>
  );
}
