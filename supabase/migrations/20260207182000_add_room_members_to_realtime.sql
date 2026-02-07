-- Enable realtime for room_members table
-- This is needed because RLS policies on messages depend on room_members
ALTER PUBLICATION supabase_realtime ADD TABLE room_members;
