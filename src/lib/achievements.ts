import { SupabaseClient } from '@supabase/supabase-js';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'workout' | 'cardio' | 'nutrition' | 'ranking' | 'points';
  requirement_type: 'streak_days' | 'submission_count' | 'workout_count' | 'cardio_count' | 'meal_count' | 'points' | 'top_rank';
  requirement_value: number;
  points_reward: number;
  order_index: number;
}

export interface StudentAchievementStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: string;
  currentValue: number;
  progressPercent: number;
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Primeiro Passo',
    description: 'Realizou o seu primeiro check-in comprovado na Arena.',
    icon: '01',
    category: 'streak',
    requirement_type: 'submission_count',
    requirement_value: 1,
    points_reward: 50,
    order_index: 1,
  },
  {
    id: 'streak_7',
    title: 'Semana de Ferro',
    description: 'Manteve 7 dias consecutivos de ofensiva sem interrupções.',
    icon: '07D',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 7,
    points_reward: 150,
    order_index: 2,
  },
  {
    id: 'streak_14',
    title: 'Constância de Elite',
    description: 'Completou 14 dias ininterruptos de disciplina e consistência.',
    icon: '14D',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 14,
    points_reward: 300,
    order_index: 3,
  },
  {
    id: 'streak_21',
    title: 'Hábito Consolidado',
    description: 'Alcançou 21 dias seguidos — seu estilo de vida foi transformado.',
    icon: '21D',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 21,
    points_reward: 500,
    order_index: 4,
  },
  {
    id: 'streak_30',
    title: 'Lenda da Arena',
    description: 'Completou os 30 dias do desafio com disciplina exemplar.',
    icon: '30D',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 30,
    points_reward: 1000,
    order_index: 5,
  },
  {
    id: 'workout_10',
    title: 'Máquina de Treino',
    description: 'Completou 10 sessões comprovadas de treino de força.',
    icon: 'W10',
    category: 'workout',
    requirement_type: 'workout_count',
    requirement_value: 10,
    points_reward: 200,
    order_index: 6,
  },
  {
    id: 'cardio_10',
    title: 'Pulmão de Aço',
    description: 'Realizou 10 sessões de cardio com ritmo e foco.',
    icon: 'C10',
    category: 'cardio',
    requirement_type: 'cardio_count',
    requirement_value: 10,
    points_reward: 200,
    order_index: 7,
  },
  {
    id: 'nutrition_15',
    title: 'Nutrição Sagrada',
    description: 'Registrou 15 refeições saudáveis alinhadas ao seu objetivo.',
    icon: 'NUT',
    category: 'nutrition',
    requirement_type: 'meal_count',
    requirement_value: 15,
    points_reward: 200,
    order_index: 8,
  },
  {
    id: 'podium_top3',
    title: 'Guerreiro do Pódio',
    description: 'Alcançou o TOP 3 no Ranking Geral da Turma.',
    icon: 'TOP3',
    category: 'ranking',
    requirement_type: 'top_rank',
    requirement_value: 3,
    points_reward: 400,
    order_index: 9,
  },
  {
    id: 'centurion',
    title: 'Centurião de XP',
    description: 'Acumulou mais de 1.000 pontos no leaderboard da turma.',
    icon: '1K',
    category: 'points',
    requirement_type: 'points',
    requirement_value: 1000,
    points_reward: 250,
    order_index: 10,
  },
];

export interface StudentMetrics {
  streakDays: number;
  totalPoints: number;
  totalSubmissions: number;
  workoutCount: number;
  cardioCount: number;
  mealCount: number;
  currentRank?: number;
}

export async function getStudentAchievementsWithProgress(
  supabase: SupabaseClient,
  studentId: string,
  challengeId: string,
  metrics: StudentMetrics
): Promise<{ list: StudentAchievementStatus[]; newlyUnlocked: Achievement[] }> {
  let achievements = DEFAULT_ACHIEVEMENTS;

  try {
    const { data: dbAchievements } = await supabase
      .from('achievements')
      .select('*')
      .order('order_index', { ascending: true });

    if (dbAchievements && dbAchievements.length > 0) {
      achievements = dbAchievements;
    }
  } catch (err) {
    console.warn('Usando conquistas padrão locais:', err);
  }

  // Buscar conquistas já desbloqueadas no Supabase
  let unlockedMap: Record<string, string> = {};
  try {
    const { data: userUnlocked } = await supabase
      .from('student_achievements')
      .select('achievement_id, unlocked_at')
      .eq('student_id', studentId)
      .eq('challenge_id', challengeId);

    if (userUnlocked) {
      userUnlocked.forEach((item: any) => {
        unlockedMap[item.achievement_id] = item.unlocked_at;
      });
    }
  } catch (err) {
    console.warn('Erro ao carregar conquistas do aluno:', err);
  }

  const newlyUnlocked: Achievement[] = [];
  const toInsert: { student_id: string; challenge_id: string; achievement_id: string }[] = [];

  const list: StudentAchievementStatus[] = achievements.map((ach) => {
    let currentValue = 0;

    switch (ach.requirement_type) {
      case 'streak_days':
        currentValue = metrics.streakDays;
        break;
      case 'submission_count':
        currentValue = metrics.totalSubmissions;
        break;
      case 'workout_count':
        currentValue = metrics.workoutCount;
        break;
      case 'cardio_count':
        currentValue = metrics.cardioCount;
        break;
      case 'meal_count':
        currentValue = metrics.mealCount;
        break;
      case 'points':
        currentValue = metrics.totalPoints;
        break;
      case 'top_rank':
        currentValue = metrics.currentRank && metrics.currentRank <= ach.requirement_value ? 1 : 0;
        break;
      default:
        currentValue = 0;
    }

    const isCriteriaMet = ach.requirement_type === 'top_rank'
      ? (metrics.currentRank !== undefined && metrics.currentRank > 0 && metrics.currentRank <= ach.requirement_value)
      : currentValue >= ach.requirement_value;

    const isAlreadyUnlocked = Boolean(unlockedMap[ach.id]);
    const isUnlocked = isAlreadyUnlocked || isCriteriaMet;

    if (isCriteriaMet && !isAlreadyUnlocked) {
      newlyUnlocked.push(ach);
      toInsert.push({
        student_id: studentId,
        challenge_id: challengeId,
        achievement_id: ach.id,
      });
    }

    const target = ach.requirement_value;
    const progressPercent = target > 0 ? Math.min(100, Math.round((currentValue / target) * 100)) : 0;

    return {
      ...ach,
      isUnlocked,
      unlockedAt: unlockedMap[ach.id] || (isCriteriaMet ? new Date().toISOString() : undefined),
      currentValue,
      progressPercent: isUnlocked ? 100 : progressPercent,
    };
  });

  // Gravar novas conquistas no Supabase
  if (toInsert.length > 0) {
    try {
      await supabase.from('student_achievements').insert(toInsert);
    } catch (err) {
      console.warn('Não foi possível persistir novas conquistas:', err);
    }
  }

  return { list, newlyUnlocked };
}
