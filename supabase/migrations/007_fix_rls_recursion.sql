-- Break the plans_collab → plan_collaborators → collabs_owner → plans cycle.
-- The inline subquery in plans_collab triggers plan_collaborators RLS, whose
-- collabs_owner policy queries plans again → infinite recursion on any
-- INSERT/UPDATE/upsert to the plans table.
-- Wrapping in SECURITY DEFINER bypasses plan_collaborators RLS inside the
-- function so collabs_owner is never evaluated during a plans policy check.

CREATE OR REPLACE FUNCTION private.is_plan_collaborator(p_plan_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.plan_collaborators
    WHERE plan_id = p_plan_id AND user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION private.is_plan_collaborator(UUID, UUID) FROM PUBLIC;

DROP POLICY IF EXISTS "plans_collab" ON public.plans;
CREATE POLICY "plans_collab" ON public.plans FOR SELECT
  USING (private.is_plan_collaborator(id, auth.uid()));
