'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  Trophy, 
  Plus, 
  CheckCircle2, 
  ShieldAlert,
  Calendar,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  Share2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

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

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Desafios do profissional
        const { data: challengesData } = await supabase
          .from('challenges')
          .select('*, missions(*)')
          .order('start_date', { ascending: false });

        const safeChallenges = challengesData || [];
        setChallenges(safeChallenges);

        // 2. Contar participantes únicos
        const { count: participantsCount } = await supabase
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true });

        // 3. Contar submissões pendentes de auditoria
        const { count: pendingCount } = await supabase
          .from('student_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // 4. Calcular faturamento estimado
        const revenue = safeChallenges.reduce((acc: number, curr: any) => {
          return acc + (Number(curr.price) || 0);
        }, 0);

        setStats({
          activeStudents: participantsCount || 0,
          totalRevenue: revenue,
          pendingSubmissions: pendingCount || 0,
          activeChallenges: safeChallenges.filter((c: any) => c.is_active).length,
        });

        // 5. Radar de Alunos em Risco (Inativos)
        const { data: atRiskData } = await supabase
          .from('at_risk_students_view')
          .select('*')
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

  return (
    <div className="space-y-8">
      {/* Top Banner / Boas-vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Cockpit do Coach
            </span>
            <span className="text-xs text-zinc-500 font-mono">ArenaPro v2.5</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Visão Geral da sua Operação</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Gerencie desafios ativos, audite check-ins por swipe e resgate alunos antes da desistência.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/audit">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
              <Clock className="h-4 w-4 mr-1.5" />
              Auditar Fotos ({stats.pendingSubmissions})
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-200 rounded-xl"
            onClick={async () => {
              if (challenges.length === 0) {
                alert('Crie um desafio antes de publicar avisos!');
                return;
              }
              const title = prompt('Título do Aviso para a Turma:');
              if (!title) return;
              const content = prompt('Mensagem / Comunicado:');
              if (!content) return;

              const { error } = await supabase.from('challenge_announcements').insert({
                challenge_id: challenges[0].id,
                title,
                content,
                is_pinned: true,
              });

              if (error) {
                alert('Erro ao publicar aviso: ' + error.message);
              } else {
                alert('Aviso publicado no Mural dos Alunos com sucesso! 📢');
              }
            }}
          >
            📢 Publicar Aviso
          </Button>
          <Link href="/dashboard/challenges/new">
            <Button size="sm" variant="outline" className="border-white/10 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-200 rounded-xl">
              <Plus className="h-4 w-4 mr-1" />
              Novo Desafio
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principais (Liquid Glass Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Alunos Ativos */}
        <div className="liquid-glass rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Alunos Ativos
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.activeStudents}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Inscritos nos desafios em curso</p>
        </div>

        {/* Card 2: Faturamento */}
        <div className="liquid-glass rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Faturamento Bruto
            </span>
            <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Valor consolidado das turmas</p>
        </div>

        {/* Card 3: Missões Aguardando Auditoria */}
        <div className="liquid-glass rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Fila de Auditoria
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">{stats.pendingSubmissions}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Check-ins pendentes de swipe</p>
        </div>

        {/* Card 4: Desafios Criados */}
        <div className="liquid-glass rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Desafios Criados
            </span>
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Trophy className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{challenges.length}</div>
          <p className="text-[11px] text-zinc-400 mt-1">{stats.activeChallenges} em andamento</p>
        </div>
      </div>

      {/* ⚠️ RADAR DE RETENÇÃO: ALUNOS EM RISCO DE DESISTÊNCIA (INATIVOS A MAIS DE 48H) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              Radar Anti-Desistência (Alunos Inativos +48h)
            </h2>
            <p className="text-xs text-zinc-400">
              Resgate esses alunos antes que abandonem. O botão abre uma mensagem carinhosa pronta no WhatsApp!
            </p>
          </div>
          <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 font-black text-xs px-2.5 py-0.5">
            {atRiskStudents.length} Alertas
          </Badge>
        </div>

        {atRiskStudents.length === 0 ? (
          <div className="liquid-glass p-4 rounded-3xl flex items-center justify-between border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-white">Turma 100% Ativa e Engajada!</p>
                <p className="text-[11px] text-emerald-400/80">Nenhum aluno está inativo há mais de 48 horas no momento.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {atRiskStudents.map((item) => {
              const studentFirstName = item.student_name?.split(' ')[0] || 'Atleta';
              const cleanPhone = item.student_phone?.replace(/\D/g, '') || '';
              const message = encodeURIComponent(
                `Fala ${studentFirstName}! Notei que você tá sumido(a) do desafio nesses últimos dias. Tá tudo bem por aí? Seu Squad e eu estamos torcendo por você, vamos voltar com tudo hoje! 🔥💪`
              );
              const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${message}` : null;

              return (
                <div
                  key={item.student_id}
                  className="liquid-glass rounded-3xl p-4.5 flex flex-col justify-between border-rose-500/30 hover:border-rose-500/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        {item.days_inactive} dias sem foto
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold">{item.challenge_title}</span>
                    </div>

                    <h4 className="text-sm font-black text-white">{item.student_name}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Última submissão: {new Date(item.last_activity_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-9 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Resgatar no WhatsApp (1-Clique)
                      </a>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(decodeURIComponent(message));
                          alert(`Mensagem de resgate copiada para a área de transferência:\n\n${decodeURIComponent(message)}`);
                        }}
                        className="w-full h-9 text-xs font-bold border-white/10 text-zinc-300 hover:text-white rounded-xl"
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                        Copiar Mensagem de Resgate
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista de Desafios Recentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white">Desafios em Andamento</h2>
          <Link href="/dashboard/missions" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold">
            Ver todas as missões <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {challenges.length === 0 && !loading ? (
          <div className="liquid-glass rounded-3xl p-8 text-center border-dashed">
            <Trophy className="h-10 w-10 mx-auto text-zinc-500 mb-3" />
            <p className="font-bold text-white text-sm">Nenhum desafio criado ainda</p>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Crie seu primeiro desafio fitness para cadastrar missões e convidar seus alunos.
            </p>
            <Link href="/dashboard/challenges/new">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl">
                Criar Primeiro Desafio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((c) => (
              <div key={c.id} className="liquid-glass rounded-3xl p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={c.is_active ? 'success' : 'secondary'} className="rounded-lg text-[10px] font-bold">
                      {c.is_active ? 'Ativo' : 'Encerrado'}
                    </Badge>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      R$ {Number(c.price).toFixed(2)}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.start_date).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(c.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                    <span>Missões configuradas:</span>
                    <span className="font-bold text-white">{c.missions?.length || 0}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Link href={`/dashboard/missions?challengeId=${c.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-white/10 hover:bg-white/5">
                        Missões
                      </Button>
                    </Link>
                    <Link href={`/dashboard/challenges/${c.id}/edit`}>
                      <Button variant="outline" size="sm" className="text-xs font-bold text-zinc-300 hover:text-white px-2.5 rounded-xl border-white/10 hover:bg-white/5">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-2.5 rounded-xl"
                      onClick={() => {
                        const link = `${window.location.origin}/join/${c.id}`;
                        navigator.clipboard.writeText(link);
                        alert(`Link copiado para o WhatsApp/Instagram:\n${link}`);
                      }}
                      title="Copiar Link de Convite para Alunos"
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Link
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
