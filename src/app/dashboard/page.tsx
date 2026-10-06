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
  Calendar
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
          <h1 className="text-3xl font-black text-white tracking-tight">Visão Geral do Profissional</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gerencie seus desafios ativos, acompanhe o engajamento e audite as fotos da sua turma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/audit">
            <Button variant="default" className="shadow-lg shadow-emerald-500/10">
              <Clock className="h-4 w-4 mr-2" />
              Auditar Fotos ({stats.pendingSubmissions})
            </Button>
          </Link>
          <Button
            variant="outline"
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
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Novo Desafio
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Alunos Ativos */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Alunos Ativos
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{stats.activeStudents}</div>
            <p className="text-xs text-zinc-500 mt-1">Inscritos nos desafios ativos</p>
          </CardContent>
        </Card>

        {/* Card 2: Faturamento */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Faturamento Estimado
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Valor somado dos desafios</p>
          </CardContent>
        </Card>

        {/* Card 3: Missões Aguardando Auditoria */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Aguardando Aprovação
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-400">{stats.pendingSubmissions}</div>
            <p className="text-xs text-zinc-500 mt-1">Fotos pendentes na fila Tinder</p>
          </CardContent>
        </Card>

        {/* Card 4: Desafios Criados */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Desafios Criados
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Trophy className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{challenges.length}</div>
            <p className="text-xs text-zinc-500 mt-1">{stats.activeChallenges} em andamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Desafios Recentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Desafios em Andamento</h2>
          <Link href="/dashboard/missions" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
            Ver todas as missões <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {challenges.length === 0 && !loading ? (
          <Card className="border-dashed border-zinc-800 p-8 text-center bg-zinc-900/20">
            <Trophy className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
            <p className="font-semibold text-zinc-300">Nenhum desafio criado ainda</p>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Crie seu primeiro desafio fitness para cadastrar missões e convidar alunos.
            </p>
            <Link href="/dashboard/challenges/new">
              <Button size="sm">Criar Meu Primeiro Desafio</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((c) => (
              <Card key={c.id} className="border-zinc-800 hover:border-zinc-700 transition-all bg-zinc-900/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={c.is_active ? 'success' : 'secondary'}>
                      {c.is_active ? 'Ativo' : 'Encerrado'}
                    </Badge>
                    <span className="text-xs font-bold text-emerald-400">
                      R$ {Number(c.price).toFixed(2)}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-white line-clamp-1">
                    {c.title}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.start_date).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(c.end_date).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80 pt-3">
                    <span>Missões configuradas:</span>
                    <span className="font-bold text-zinc-200">{c.missions?.length || 0}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/missions?challengeId=${c.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Configurar Missões
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-3"
                      onClick={() => {
                        const link = `${window.location.origin}/join/${c.id}`;
                        navigator.clipboard.writeText(link);
                        alert(`Link copiado para o WhatsApp/Instagram:\n${link}`);
                      }}
                      title="Copiar Link de Convite para Alunos"
                    >
                      Copiar Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
