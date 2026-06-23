-- Leisurely Phase 3 — Collaboration schema
-- Run AFTER 001_initial.sql.
-- Paste into SQL Editor or run via: supabase db push

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- Auto-created for every new auth user via trigger.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- PLAN COLLABORATORS
-- Links non-owner users to plans they have been invited to.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plan_collaborators (
  plan_id    UUID REFERENCES plans ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  invited_by UUID REFERENCES auth.users,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (plan_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE REPLIES
-- Stored relationally so all collaborators see replies in real time.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS note_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id    UUID REFERENCES notes ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE LIKES
-- One row per (note, user) — prevents double-liking and enables real-time counts.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS note_likes (
  note_id UUID REFERENCES notes ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (note_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ADD plan_id TO NOTES
-- Ties bulletin posts to a plan's collaboration scope.
-- Nullable so existing notes without a plan still work.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE notes ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: can_access_plan
-- Returns true if p_user_id owns the plan, it is public, or they are a collaborator.
-- SECURITY DEFINER so it can read plans/plan_collaborators regardless of caller RLS.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION can_access_plan(p_plan_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM plans
    WHERE id = p_plan_id
      AND (user_id = p_user_id OR is_public = true)
    UNION ALL
    SELECT 1 FROM plan_collaborators
    WHERE plan_id = p_plan_id
      AND user_id = p_user_id
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW-LEVEL SECURITY — new tables
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_replies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_likes         ENABLE ROW LEVEL SECURITY;

-- profiles: anyone authenticated can read; users manage their own row
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_own"    ON profiles FOR ALL   USING (auth.uid() = id);

-- plan_collaborators: plan owner manages all rows; collaborators can read their own
CREATE POLICY "collabs_owner"  ON plan_collaborators FOR ALL
  USING (EXISTS (SELECT 1 FROM plans WHERE id = plan_id AND user_id = auth.uid()));
CREATE POLICY "collabs_self"   ON plan_collaborators FOR SELECT
  USING (user_id = auth.uid());

-- note_replies: author all; anyone who can access the note's plan can read
CREATE POLICY "replies_author" ON note_replies FOR ALL   USING (user_id = auth.uid());
CREATE POLICY "replies_read"   ON note_replies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM notes n
    WHERE n.id = note_id
      AND (n.user_id = auth.uid() OR can_access_plan(n.plan_id, auth.uid()))
  ));

-- note_likes: users manage their own; authenticated users can read all counts
CREATE POLICY "likes_own"    ON note_likes FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "likes_read"   ON note_likes FOR SELECT USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE RLS ON EXISTING TABLES — allow collaborators to access shared plans
-- ─────────────────────────────────────────────────────────────────────────────

-- plans: collaborators can read (owner policy from migration 001 covers write)
DROP POLICY IF EXISTS "plans_collab" ON plans;
CREATE POLICY "plans_collab" ON plans FOR SELECT
  USING (EXISTS (SELECT 1 FROM plan_collaborators WHERE plan_id = id AND user_id = auth.uid()));

-- meals: collaborators with editor role can do everything; viewers can read
DROP POLICY IF EXISTS "meals_collab_editor" ON meals;
DROP POLICY IF EXISTS "meals_collab_viewer" ON meals;
CREATE POLICY "meals_collab_editor" ON meals FOR ALL
  USING (EXISTS (
    SELECT 1 FROM plan_collaborators
    WHERE plan_id = meals.plan_id AND user_id = auth.uid() AND role = 'editor'
  ));
CREATE POLICY "meals_collab_viewer" ON meals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plan_collaborators
    WHERE plan_id = meals.plan_id AND user_id = auth.uid()
  ));

-- grocery_items: same pattern as meals
DROP POLICY IF EXISTS "grocery_collab_editor" ON grocery_items;
DROP POLICY IF EXISTS "grocery_collab_viewer" ON grocery_items;
CREATE POLICY "grocery_collab_editor" ON grocery_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM plan_collaborators
    WHERE plan_id = grocery_items.plan_id AND user_id = auth.uid() AND role = 'editor'
  ));
CREATE POLICY "grocery_collab_viewer" ON grocery_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plan_collaborators
    WHERE plan_id = grocery_items.plan_id AND user_id = auth.uid()
  ));

-- packing_items: same pattern
DROP POLICY IF EXISTS "packing_collab_editor" ON packing_items;
DROP POLICY IF EXISTS "packing_collab_viewer" ON packing_items;
CREATE POLICY "packing_collab_editor" ON packing_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM plan_collaborators
    WHERE plan_id = packing_items.plan_id AND user_id = auth.uid() AND role = 'editor'
  ));
CREATE POLICY "packing_collab_viewer" ON packing_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM plan_collaborators
    WHERE plan_id = packing_items.plan_id AND user_id = auth.uid()
  ));

-- notes: collaborators on the same plan can read and post
DROP POLICY IF EXISTS "notes_collab" ON notes;
CREATE POLICY "notes_collab" ON notes FOR ALL
  USING (plan_id IS NOT NULL AND can_access_plan(plan_id, auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- REALTIME — extend publication to include collaboration tables
-- ─────────────────────────────────────────────────────────────────────────────
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE
    plans, meals, grocery_items, notes, packing_items,
    plan_collaborators, note_replies, note_likes;
COMMIT;
