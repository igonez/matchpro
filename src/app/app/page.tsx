'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Camera, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  ChevronRight, 
  Sparkles,
  LogOut
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function StudentFeedPage() {
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    async function loadFeed() {
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

        setStudent(studentData || { full_name: 'Atleta' });

        // 2. Buscar missões ativas
        const { data: missionsData } = await supabase
          .from('missions')
          .select('*, challenges(title, is_active)')
          .order('points_rewarded', { ascending: false });

        setMissions(missionsData || []);

        // 3. Buscar submissões do aluno para hoje
        const { data: submissionsData } = await supabase
          .from('student_submissions')
          .select('*')
          .eq('student_id', user.id);

        if (submissionsData) {
          const map: Record<string, any> = {};
          submissionsData.forEach((sub: any) => {
            // Guarda a submissão mais recente para cada missão
            map[sub.mission_id] = sub;
          });
          setSubmissions(map);
        }
      } catch (err) {
        console.error('Erro ao carregar feed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [supabase, router]);

  return (
    <div className="flex flex-col flex-1">
      {/* Top Header Mobile */}
      <header className="p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-tight">
              Olá, {student?.full_name?.split(' ')[0] || 'Atleta'}! 👋
            </h1>
            <p className="text-[11px] text-zinc-400">Suas missões diárias de hoje</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="text-zinc-500 hover:text-rose-400 p-2 rounded-lg transition-colors"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Hero Banner Gamificado */}
      <div className="p-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 p-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold tracking-wide uppercase mb-2">
              <Sparkles className="h-3 w-3" /> Foco Total
            </div>
            <h2 className="text-lg font-black text-white">Cumpra suas metas hoje</h2>
            <p className="text-xs text-zinc-300 mt-0.5">
              Tire fotos em tempo real para comprovar suas refeições e treinos e subir no ranking.
            </p>
          </div>
          <Flame className="absolute -right-2 -bottom-4 h-24 w-24 text-emerald-500/10 rotate-12 pointer-events-none" />
        </div>
      </div>

      {/* Lista de Missões do Dia */}
      <div className="p-4 pt-0 space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Missões Diárias ({missions.length})
          </h2>
          <span className="text-[11px] text-emerald-400 font-semibold">Câmera obrigatória</span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
            <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Carregando suas missões...
          </div>
        ) : missions.length === 0 ? (
          <Card className="border-dashed border-zinc-800 p-8 text-center bg-zinc-900/30">
            <p className="font-semibold text-xs text-zinc-300">Nenhuma missão liberada hoje</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Aguarde seu treinador cadastrar as tarefas do desafio.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {missions.map((mission) => {
              const submission = submissions[mission.id];
              const isApproved = submission?.status === 'approved';
              const isPending = submission?.status === 'pending';
              const isRejected = submission?.status === 'rejected';

              return (
                <Card
                  key={mission.id}
                  className="border-zinc-850 bg-zinc-900/50 hover:border-zinc-800 transition-all p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{mission.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="text-[10px] py-0 px-2 font-bold">
                          +{mission.points_rewarded} pts
                        </Badge>
                        {mission.challenges?.title && (
                          <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                            {mission.challenges.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status / Ação */}
                    <div>
                      {isApproved && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          Concluída
                        </div>
                      )}

                      {isPending && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                          <Clock className="h-4 w-4 animate-spin" />
                          Aguardando
                        </div>
                      )}

                      {isRejected && (
                        <Link href={`/app/camera/${mission.id}`}>
                          <Button size="sm" variant="destructive" className="h-9 px-3 text-xs">
                            <XCircle className="h-4 w-4 mr-1" />
                            Refazer Foto
                          </Button>
                        </Link>
                      )}

                      {!submission && (
                        <Link href={`/app/camera/${mission.id}`}>
                          <Button size="sm" className="h-9 px-3 text-xs shadow-md shadow-emerald-950/20">
                            <Camera className="h-4 w-4 mr-1.5" />
                            Enviar Foto
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
