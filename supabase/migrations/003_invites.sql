-- Plan invite tokens for email-based collaboration
CREATE TABLE IF NOT EXISTS plan_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID REFERENCES plans ON DELETE CASCADE NOT NULL,
  email       TEXT NOT NULL,
  token       TEXT UNIQUE NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 8),
  invited_by  UUID REFERENCES auth.users ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ
);

ALTER TABLE plan_invites ENABLE ROW LEVEL SECURITY;

-- Invite owner can insert / select / delete their own invites
CREATE POLICY "invites_owner" ON plan_invites
  FOR ALL
  USING (auth.uid() = invited_by);

-- Anyone can read an invite row (token-gated lookups in the app)
CREATE POLICY "invites_recipient" ON plan_invites
  FOR SELECT
  USING (true);
