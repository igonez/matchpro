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
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function StudentProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<any>(null);
  const [standing, setStanding] = useState<any>(null);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [userPhotos, setUserPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-xl font-black text-white">Meu Perfil</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-xs text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4 mr-1.5" /> Sair
        </Button>
      </div>

      {/* Card Principal do Usuário */}
      <Card className="border-zinc-850 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 rounded-3xl shadow-xl text-center">
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-xl shadow-emerald-500/20 mb-3">
          <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center font-black text-2xl text-emerald-400">
            {student?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-black">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
        </div>

        <h2 className="text-lg font-black text-white">{student?.full_name || 'Atleta MatchPro'}</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Aluno Oficial do Desafio</p>

        {/* Estatísticas Rápidas em Grid */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-zinc-850/80">
          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-850">
            <span className="text-xs text-zinc-400 block font-semibold">Pontos</span>
            <span className="text-base font-black text-emerald-400 mt-0.5 block">
              {standing?.total_points || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-850">
            <span className="text-xs text-zinc-400 block font-semibold">Streak</span>
            <span className="text-base font-black text-orange-400 mt-0.5 block">
              3 Dias 🔥
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-850">
            <span className="text-xs text-zinc-400 block font-semibold">Fotos</span>
            <span className="text-base font-black text-white mt-0.5 block">
              {submissionsCount}
            </span>
          </div>
        </div>
      </Card>

      {/* Histórico de Fotos do Aluno */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Minha Galeria de Missões ({userPhotos.length})
        </h3>

        {userPhotos.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-zinc-850 rounded-2xl">
            Nenhuma foto enviada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {userPhotos.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group"
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
                  <span className={`text-[9px] font-black uppercase mt-1 ${
                    item.status === 'approved' ? 'text-emerald-400' : item.status === 'rejected' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {item.status === 'approved' ? 'Aprovada' : item.status === 'rejected' ? 'Recusada' : 'Análise'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
