-- Grant authenticated role full DML on all public tables.
-- These grants were missing because the project's ALTER DEFAULT PRIVILEGES
-- applied only to future tables, not to the tables created via manually-run
-- migration scripts.  RLS still enforces row-level access; this just allows
-- the authenticated role to attempt the operations in the first place.

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT                          ON ALL TABLES IN SCHEMA public TO anon;

-- Sequences are UUID-keyed so not strictly required, but belt-and-suspenders:
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
