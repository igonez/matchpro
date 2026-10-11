-- ==============================================================================
-- CORREÇÃO DE SEGURANÇA: SECURITY DEFINER VIEWS -> SECURITY INVOKER
-- ==============================================================================
-- Por padrão no PostgreSQL, views rodam como SECURITY DEFINER (com privilégios de superusuário),
-- o que ignora as regras de Row Level Security (RLS) das tabelas originais.
-- Ativar `security_invoker = true` força a view a respeitar as permissões e RLS do usuário conectado.

ALTER VIEW IF EXISTS public.squad_standings SET (security_invoker = true);
ALTER VIEW IF EXISTS public.at_risk_students_view SET (security_invoker = true);
ALTER VIEW IF EXISTS public.submissions SET (security_invoker = true);
ALTER VIEW IF EXISTS public.squads SET (security_invoker = true);
