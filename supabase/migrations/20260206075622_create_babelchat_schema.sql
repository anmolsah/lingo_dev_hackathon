/*
  # BabelChat Database Schema

  1. New Tables
    - `profiles` - user profiles with display name and language preference
    - `rooms` - chat rooms
    - `room_members` - many-to-many relationship between rooms and users
    - `messages` - chat messages with source language tracking
    - `message_translations` - cached translations of messages

  2. Functions & Triggers
    - `handle_new_user()` - auto-creates profile on signup
    - `add_user_to_general_room()` - auto-adds new users to General room

  3. Security
    - RLS enabled on all tables with restrictive policies
    - All access requires authentication and membership checks

  4. Realtime
    - Messages and message_translations added to realtime publication

  5. Default Data
    - General room created for all users
*/

-- 1. Create all tables first

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  preferred_language text NOT NULL DEFAULT 'en',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  source_language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  target_language text NOT NULL,
  translated_content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, target_language)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_translations_message_id ON message_translations(message_id);
CREATE INDEX IF NOT EXISTS idx_message_translations_language ON message_translations(target_language);

-- 3. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_translations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Profiles
CREATE POLICY "Users can view profiles of shared room members"
  ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM room_members rm1
      JOIN room_members rm2 ON rm1.room_id = rm2.room_id
      WHERE rm1.user_id = auth.uid() AND rm2.user_id = profiles.id
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Rooms
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

-- Room members
CREATE POLICY "Members can view room membership"
  ON room_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_members my_membership
      WHERE my_membership.room_id = room_members.room_id
      AND my_membership.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms or be added by creator"
  ON room_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_id
      AND rooms.created_by = auth.uid()
    )
  );

-- Messages
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

-- Message translations
CREATE POLICY "Members can view translations"
  ON message_translations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN room_members ON room_members.room_id = messages.room_id
      WHERE messages.id = message_translations.message_id
      AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert translations"
  ON message_translations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      JOIN room_members ON room_members.room_id = messages.room_id
      WHERE messages.id = message_translations.message_id
      AND room_members.user_id = auth.uid()
    )
  );

-- 5. Triggers

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 6. Default General room
INSERT INTO rooms (id, name, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'General',
  'Welcome to BabelChat! The general discussion room for everyone.'
) ON CONFLICT DO NOTHING;

-- Function to auto-add users to General room
CREATE OR REPLACE FUNCTION add_user_to_general_room()
RETURNS trigger AS $$
BEGIN
  INSERT INTO room_members (room_id, user_id)
  VALUES ('00000000-0000-0000-0000-000000000001', NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION add_user_to_general_room();

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_translations;
