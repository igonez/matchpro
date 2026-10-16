-- ==============================================================================
-- MIGRAÇÃO DE CORREÇÃO: CICLO DE PONTOS DO RANKING (INSERT + UPDATE + DEDUÇÃO)
-- Execute este script no SQL Editor do Supabase (czwddyjhciqprjurevte)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_challenge_id UUID;
  v_points INT;
BEGIN
  -- Buscar o ID do desafio e pontuação associada à missão
  SELECT challenge_id, points_rewarded INTO v_challenge_id, v_points
  FROM public.missions 
  WHERE id = COALESCE(NEW.mission_id, OLD.mission_id);

  -- Cenário A: Nova submissão aprovada ou transição para aprovada
  IF (TG_OP = 'INSERT' AND NEW.status = 'approved') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved') THEN
    INSERT INTO public.leaderboard_standings (challenge_id, student_id, total_points)
    VALUES (COALESCE(NEW.challenge_id, v_challenge_id), NEW.student_id, v_points)
    ON CONFLICT (challenge_id, student_id)
    DO UPDATE SET total_points = leaderboard_standings.total_points + EXCLUDED.total_points;

  -- Cenário B: Submissão que era aprovada foi rejeitada pelo treinador (dedução de pontos)
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status = 'rejected') THEN
    UPDATE public.leaderboard_standings
    SET total_points = GREATEST(0, total_points - v_points)
    WHERE challenge_id = COALESCE(NEW.challenge_id, v_challenge_id) AND student_id = NEW.student_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar o trigger na tabela student_submissions
DROP TRIGGER IF EXISTS on_submission_approved ON public.student_submissions;
DROP TRIGGER IF EXISTS on_submission_lifecycle ON public.student_submissions;

CREATE TRIGGER on_submission_approved
  AFTER INSERT OR UPDATE ON public.student_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_submission_approval();
