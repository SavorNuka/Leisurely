-- Leisurely Phase 4 — Author attribution columns
-- Run AFTER 003_invites.sql.

-- notes and note_replies both need author_name for display attribution.
-- Existing sync.ts code already pushes/reads these columns; this migration
-- makes the schema authoritative for fresh deployments.

ALTER TABLE notes        ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE note_replies ADD COLUMN IF NOT EXISTS author_name TEXT;
