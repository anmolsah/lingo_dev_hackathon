-- PolyConnect Database Migration
-- Run this AFTER the original schema to add new tables and columns
-- Safe to run multiple times - uses IF NOT EXISTS and ADD COLUMN IF NOT EXISTS

-- =========================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =========================================

-- Add new columns to questions table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'is_closed') THEN
    ALTER TABLE questions ADD COLUMN is_closed BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'accepted_answer_id') THEN
    ALTER TABLE questions ADD COLUMN accepted_answer_id UUID;
  END IF;
END $$;

-- =========================================
-- 1. USER PROFILES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 2. USER LANGUAGES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS user_languages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  proficiency_level VARCHAR(20) NOT NULL DEFAULT 'intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, language_code)
);

-- =========================================
-- 3. VOTES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT vote_target CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL) OR 
    (question_id IS NULL AND answer_id IS NOT NULL)
  )
);

-- Add unique constraints if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'votes_user_id_question_id_key') THEN
    ALTER TABLE votes ADD CONSTRAINT votes_user_id_question_id_key UNIQUE (user_id, question_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'votes_user_id_answer_id_key') THEN
    ALTER TABLE votes ADD CONSTRAINT votes_user_id_answer_id_key UNIQUE (user_id, answer_id);
  END IF;
END $$;

-- =========================================
-- 4. BOOKMARKS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- =========================================
-- 5. TAGS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  questions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 6. COMMUNITIES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT 'bg-blue-500',
  icon_url TEXT,
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 7. COMMUNITY MEMBERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- =========================================
-- 8. BADGES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(30) DEFAULT 'bg-blue-100',
  requirement_type VARCHAR(50),
  requirement_count INTEGER DEFAULT 1
);

-- =========================================
-- 9. USER BADGES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =========================================
-- 10. NOTIFICATIONS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================

-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (to avoid errors)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own languages" ON user_languages;
DROP POLICY IF EXISTS "Users can manage own languages" ON user_languages;
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;
DROP POLICY IF EXISTS "Users can manage own votes" ON votes;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
DROP POLICY IF EXISTS "Community members are viewable by everyone" ON community_members;
DROP POLICY IF EXISTS "Users can manage own memberships" ON community_members;
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON badges;
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON user_badges;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Allow inserts from SECURITY DEFINER trigger or the user themselves
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own languages" ON user_languages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own languages" ON user_languages FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can manage own votes" ON votes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);

CREATE POLICY "Communities are viewable by everyone" ON communities FOR SELECT USING (true);

CREATE POLICY "Community members are viewable by everyone" ON community_members FOR SELECT USING (true);
CREATE POLICY "Users can manage own memberships" ON community_members FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);

CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =========================================
-- TRIGGERS
-- =========================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update vote counts
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
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.question_id IS NOT NULL THEN
      UPDATE questions SET votes = votes - OLD.vote_type + NEW.vote_type WHERE id = NEW.question_id;
    END IF;
    IF NEW.answer_id IS NOT NULL THEN
      UPDATE answers SET votes = votes - OLD.vote_type + NEW.vote_type WHERE id = NEW.answer_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vote_counts_trigger ON votes;
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- =========================================
-- ENABLE REALTIME ON NEW TABLES
-- =========================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN
  -- Table might already be in publication
  NULL;
END $$;

-- =========================================
-- SEED DATA
-- =========================================

-- Default badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_count) VALUES
  ('First Question', 'Asked your first question', '❓', 'bg-blue-100', 'questions_asked', 1),
  ('First Answer', 'Posted your first answer', '🏅', 'bg-amber-100', 'answers_given', 1),
  ('Helpful', 'Received 10 upvotes on answers', '⭐', 'bg-blue-100', 'answer_votes', 10),
  ('Polyglot', 'Asked questions in 3 different languages', '🌍', 'bg-green-100', 'languages_used', 3),
  ('Top Contributor', 'Gave 50 answers', '🏆', 'bg-purple-100', 'answers_given', 50),
  ('Popular Question', 'Question received 100 views', '👁️', 'bg-pink-100', 'question_views', 100)
ON CONFLICT (name) DO NOTHING;

-- Default communities
INSERT INTO communities (code, name, description, color) VALUES
  ('JS', 'JavaScript', 'Everything about JavaScript, TypeScript, and Node.js', 'bg-yellow-500'),
  ('PY', 'Python', 'Python programming, Django, Flask, and more', 'bg-blue-500'),
  ('ES', 'Español', 'Comunidad hispanohablante para programadores', 'bg-red-500'),
  ('REACT', 'React', 'React, React Native, and the React ecosystem', 'bg-cyan-500'),
  ('AI', 'AI & ML', 'Artificial Intelligence and Machine Learning', 'bg-purple-500')
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- DONE! Migration complete.
-- =========================================

SELECT 'Migration completed successfully!' AS status;
