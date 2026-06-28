-- Allow a user to add themselves as a collaborator when a valid (unexpired,
-- not-yet-accepted) invite exists for that plan.  Without this policy the
-- client-side upsert in processInvite() silently fails for new collaborators
-- because collabs_owner (FOR ALL) requires being the plan owner and
-- collabs_self (FOR SELECT) only covers reads.

CREATE POLICY "collabs_invite_accept" ON plan_collaborators
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM plan_invites
      WHERE plan_id  = plan_collaborators.plan_id
        AND accepted_at IS NULL
        AND expires_at  > now()
    )
  );
