/*
  # Fix signup trigger functions

  1. Changes
    - Recreate `handle_new_user()` with SET search_path to bypass RLS issues
    - Recreate `add_user_to_general_room()` with SET search_path to bypass RLS issues
    - Both functions use SECURITY DEFINER and SET search_path = '' for safety

  2. Notes
    - The original functions were failing on signup because RLS policies
      on profiles referenced room_members, creating a circular dependency
      during the signup transaction
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION add_user_to_general_room()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.room_members (room_id, user_id)
  VALUES ('00000000-0000-0000-0000-000000000001', NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
