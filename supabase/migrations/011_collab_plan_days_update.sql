-- Leisurely Migration 011 — Allow collaborators to update plan slot assignments
--
-- Problem: collaborators assign meals to slots (updates plan.days locally) but
-- cannot write the plan row, so slot assignments are never persisted. On the
-- next syncDown the old days array overwrites the local state and the meal
-- appears to vanish from its slot.
--
-- Fix: grant editor-role collaborators UPDATE on the plans table. Application
-- code in pushPlan constrains the update to only days + updated_at columns.

CREATE POLICY "plans_collab_update" ON public.plans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_collaborators
      WHERE plan_id = public.plans.id
        AND user_id = auth.uid()
        AND role = 'editor'
    )
  );
