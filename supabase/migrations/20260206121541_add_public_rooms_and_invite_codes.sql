/*
  # Add public rooms and invite codes

  1. Modified Tables
    - `rooms`
      - Added `is_public` (boolean, default true) - whether room appears in public directory
      - Added `invite_code` (text, unique, auto-generated) - shareable code for joining private rooms

  2. New Functions
    - `generate_invite_code()` - generates random 8-character alphanumeric invite codes
    - `get_public_rooms_with_counts()` - returns public rooms with member counts for the browse directory
    - `join_room_by_invite_code(code)` - joins a room (public or private) using its invite code

  3. Security Changes
    - Updated rooms SELECT policy to allow all authenticated users to see public rooms
    - Room membership and messages remain restricted to members only
    - join_room_by_invite_code uses SECURITY DEFINER to safely look up private rooms by code

  4. Notes
    - All existing rooms default to public (is_public = true)
    - Invite codes are auto-generated for all existing and new rooms
    - The General room remains public and accessible to all
*/

-- Function to generate random 8-char invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Add is_public column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE rooms ADD COLUMN is_public boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add invite_code column with auto-generation default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'invite_code'
  ) THEN
    ALTER TABLE rooms ADD COLUMN invite_code text UNIQUE DEFAULT generate_invite_code();
  END IF;
END $$;

-- Populate invite codes for any existing rooms that don't have one
UPDATE rooms SET invite_code = generate_invite_code() WHERE invite_code IS NULL;

-- Ensure invite_code is NOT NULL going forward
ALTER TABLE rooms ALTER COLUMN invite_code SET NOT NULL;

-- Update rooms SELECT policy to include public rooms
DROP POLICY IF EXISTS "Members or creator can view rooms" ON rooms;

CREATE POLICY "Authenticated users can view accessible rooms"
  ON rooms FOR SELECT TO authenticated
  USING (
    is_public = true OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = rooms.id
      AND room_members.user_id = auth.uid()
    )
  );

-- Function to browse public rooms with member counts
CREATE OR REPLACE FUNCTION get_public_rooms_with_counts()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  created_by uuid,
  created_at timestamptz,
  is_public boolean,
  member_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    r.id, r.name, r.description, r.created_by, r.created_at, r.is_public,
    (SELECT count(*) FROM public.room_members rm WHERE rm.room_id = r.id) as member_count
  FROM public.rooms r
  WHERE r.is_public = true
  ORDER BY (SELECT count(*) FROM public.room_members rm WHERE rm.room_id = r.id) DESC, r.created_at ASC;
$$;

-- Function to join a room by invite code (works for both public and private rooms)
CREATE OR REPLACE FUNCTION join_room_by_invite_code(code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  found_room_id uuid;
BEGIN
  SELECT r.id INTO found_room_id FROM public.rooms r WHERE r.invite_code = code;

  IF found_room_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  INSERT INTO public.room_members (room_id, user_id)
  VALUES (found_room_id, auth.uid())
  ON CONFLICT DO NOTHING;

  RETURN found_room_id;
END;
$$;