/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - The room_members SELECT policy queried room_members itself, causing infinite recursion
    - The profiles SELECT policy also queried room_members, which triggered the same loop
    - The rooms SELECT policy queried room_members, hitting the recursive policy

  2. Solution
    - Drop all existing policies on profiles, rooms, room_members, messages, message_translations
    - Recreate with non-recursive patterns:
      - room_members: use direct user_id check (no self-reference)
      - profiles: allow all authenticated users to read (needed for chat display names)
      - rooms: check room_members with simple user_id match
      - messages/translations: check room_members with simple user_id match

  3. Security
    - All tables still require authentication
    - Write operations still check ownership
    - The profiles SELECT is broader but necessary to avoid recursion
*/

-- Drop all existing policies

DROP POLICY IF EXISTS "Users can view profiles of shared room members" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Members can view their rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON rooms;

DROP POLICY IF EXISTS "Members can view room membership" ON room_members;
DROP POLICY IF EXISTS "Users can join rooms or be added by creator" ON room_members;

DROP POLICY IF EXISTS "Members can view room messages" ON messages;
DROP POLICY IF EXISTS "Members can send messages to their rooms" ON messages;

DROP POLICY IF EXISTS "Members can view translations for their room messages" ON message_translations;
DROP POLICY IF EXISTS "Members can insert translations for their room messages" ON message_translations;
DROP POLICY IF EXISTS "Members can view translations" ON message_translations;
DROP POLICY IF EXISTS "Members can insert translations" ON message_translations;

-- Profiles: authenticated users can read all profiles (needed for displaying sender names in chat)
CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Room members: direct user_id check, no self-referencing subquery
CREATE POLICY "Users can view their own memberships"
  ON room_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join or be added to rooms"
  ON room_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_id
      AND rooms.created_by = auth.uid()
    )
  );

-- Rooms: check membership via room_members (safe now since room_members policy doesn't self-reference)
CREATE POLICY "Members can view their rooms"
  ON rooms FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = rooms.id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create rooms"
  ON rooms FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Messages: check membership via room_members
CREATE POLICY "Members can view room messages"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = messages.room_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages to their rooms"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = messages.room_id
      AND room_members.user_id = auth.uid()
    )
  );

-- Message translations: check membership via room_members -> messages
CREATE POLICY "Members can view message translations"
  ON message_translations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN room_members ON room_members.room_id = messages.room_id
      WHERE messages.id = message_translations.message_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert message translations"
  ON message_translations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      JOIN room_members ON room_members.room_id = messages.room_id
      WHERE messages.id = message_translations.message_id
      AND room_members.user_id = auth.uid()
    )
  );
