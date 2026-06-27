-- Leisurely Migration 006 — Move internal functions to private schema
-- Addresses remaining Supabase lint warnings after migration 005:
--   0011: update_updated_at missing search_path
--   0028/0029: can_access_plan and handle_new_user callable via public RPC
--
-- Paste into Supabase SQL Editor and run once.

-- Fix update_updated_at search_path (trigger function, not SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Revoke public execute on handle_new_user (trigger invocation bypasses EXECUTE check)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Create private schema (not exposed by PostgREST) and move can_access_plan there
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.can_access_plan(p_plan_id UUID, p_user_id UUID)
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

-- Update RLS policies to reference private.can_access_plan
DROP POLICY IF EXISTS "replies_read" ON note_replies;
CREATE POLICY "replies_read" ON note_replies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM notes n
    WHERE n.id = note_id
      AND (n.user_id = auth.uid() OR private.can_access_plan(n.plan_id, auth.uid()))
  ));

DROP POLICY IF EXISTS "notes_collab" ON notes;
CREATE POLICY "notes_collab" ON notes FOR ALL
  USING (plan_id IS NOT NULL AND private.can_access_plan(plan_id, auth.uid()));

-- Remove the now-redundant public version
DROP FUNCTION IF EXISTS public.can_access_plan(UUID, UUID);
