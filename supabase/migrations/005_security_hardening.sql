-- Leisurely Migration 005 — Security hardening
-- Addresses Supabase lint warnings:
--   0029: SECURITY DEFINER functions callable by anon/authenticated via RPC
--   0011: SECURITY DEFINER functions with mutable search_path
--
-- Paste into Supabase SQL Editor and run once.

-- ─────────────────────────────────────────────────────────────────────────────
-- rls_auto_enable — Supabase-internal function
-- Revoke public RPC access; pin search_path so schema resolution is stable.
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
ALTER  FUNCTION public.rls_auto_enable() SET search_path = '';

-- ─────────────────────────────────────────────────────────────────────────────
-- handle_new_user — trigger function (not exposed via RPC, but pin path anyway)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- can_access_plan — used in RLS policies; pin path and fully-qualify all refs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.can_access_plan(p_plan_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.plans
    WHERE id = p_plan_id
      AND (user_id = p_user_id OR is_public = true)
    UNION ALL
    SELECT 1 FROM public.plan_collaborators
    WHERE plan_id = p_plan_id
      AND user_id = p_user_id
  );
END;
$$;
