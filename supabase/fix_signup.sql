-- COMPLETE DATABASE FIX (DO NOT MODIFY!)
-- Run this ENTIRE script in your Supabase SQL Editor

-- =========================================
-- STEP 1: Enable UUID extension
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- STEP 2: Ensure profiles table exists
-- =========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (true);

-- =========================================
-- STEP 3: Ensure votes table exists
-- =========================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;
DROP POLICY IF EXISTS "Users can view own votes" ON votes;
DROP POLICY IF EXISTS "Users can insert votes" ON votes;
DROP POLICY IF EXISTS "Users can update votes" ON votes;
DROP POLICY IF EXISTS "Users can delete votes" ON votes;

-- Users can see their own votes
CREATE POLICY "Users can view own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
-- Users can insert their own votes
CREATE POLICY "Users can insert votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own votes
CREATE POLICY "Users can update votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
-- Users can delete their own votes
CREATE POLICY "Users can delete votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- STEP 4: Ensure bookmarks table exists
-- =========================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete bookmarks" ON bookmarks;

CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- STEP 5: Create profile trigger
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- STEP 6: Create vote count trigger
-- =========================================
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.question_id IS NOT NULL THEN
      UPDATE questions SET votes = votes + NEW.vote_type WHERE id = NEW.question_id;
    END IF;
    IF NEW.answer_id IS NOT NULL THEN
      UPDATE answers SET votes = votes + NEW.vote_type WHERE id = NEW.answer_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.question_id IS NOT NULL THEN
      UPDATE questions SET votes = votes - OLD.vote_type WHERE id = OLD.question_id;
    END IF;
    IF OLD.answer_id IS NOT NULL THEN
      UPDATE answers SET votes = votes - OLD.vote_type WHERE id = OLD.answer_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vote_count_trigger ON votes;
CREATE TRIGGER vote_count_trigger
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- =========================================
-- STEP 7: Create profiles for existing users
-- =========================================
INSERT INTO profiles (id, username, display_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- STEP 8: Create answer count trigger
-- =========================================
CREATE OR REPLACE FUNCTION update_answer_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE questions SET answers_count = answers_count + 1 WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE questions SET answers_count = answers_count - 1 WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS answer_count_trigger ON answers;
CREATE TRIGGER answer_count_trigger
  AFTER INSERT OR DELETE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_answer_counts();

-- =========================================
-- VERIFY
-- =========================================
SELECT 'Users:' AS info, COUNT(*) FROM auth.users;
SELECT 'Profiles:' AS info, COUNT(*) FROM profiles;
SELECT 'Votes table exists:' AS info, EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'votes');
SELECT 'Bookmarks table exists:' AS info, EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'bookmarks');

SELECT '✅ COMPLETE! Refresh your app and try again.' AS status;
