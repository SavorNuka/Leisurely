-- Grant authenticated role the ability to invoke private schema functions
-- that are called from RLS policies on plans and notes.
-- private schema was created without USAGE grants, and 007 revoked EXECUTE
-- from PUBLIC for is_plan_collaborator, so authenticated couldn't call either
-- function — PostgreSQL surfaced this as "permission denied for table plans/notes".

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_plan_collaborator(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_access_plan(UUID, UUID) TO authenticated;
