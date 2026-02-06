/*
  # Fix rooms SELECT policy to allow creators to see their own rooms

  1. Problem
    - When creating a room, the `.select('id')` after INSERT fails with 403
    - The SELECT policy only checks room_members, but the creator hasn't been
      added as a member yet at that point

  2. Solution
    - Drop the existing rooms SELECT policy
    - Recreate it to also allow the room creator to see the room
    - This lets the INSERT...RETURNING flow work before the member row is added

  3. Security
    - Still requires authentication
    - Users can only see rooms they created OR are a member of
*/

DROP POLICY IF EXISTS "Members can view their rooms" ON rooms;

CREATE POLICY "Members or creator can view rooms"
  ON rooms FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = rooms.id
      AND room_members.user_id = auth.uid()
    )
  );
