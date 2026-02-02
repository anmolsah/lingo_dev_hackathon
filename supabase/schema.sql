-- PolyConnect Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
  author_id UUID, -- Optional, for authenticated users
  tags TEXT[] DEFAULT '{}',
  original_language VARCHAR(10) NOT NULL DEFAULT 'en',
  votes INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
  author_id UUID,
  original_language VARCHAR(10) NOT NULL DEFAULT 'en',
  votes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Answers are viewable by everyone" ON answers
  FOR SELECT USING (true);

-- Policies for insert (anyone can post for demo purposes)
CREATE POLICY "Anyone can create questions" ON questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create answers" ON answers
  FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;

-- Function to update answers_count when new answer is added
CREATE OR REPLACE FUNCTION update_answers_count()
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

-- Trigger for answers_count
CREATE TRIGGER update_question_answers_count
  AFTER INSERT OR DELETE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_answers_count();

-- Sample data for testing
INSERT INTO questions (title, body, author_name, tags, original_language, votes, views) VALUES
  ('How do I handle unicode strings effectively in Python 3?', 
   'I''m working on a cross-platform application that needs to handle text in multiple languages including Chinese, Arabic, and Hindi. What are the best practices?',
   'CodeMaster', ARRAY['python', 'unicode', 'cross-platform'], 'en', 42, 156),
  
  ('Best practices for managing state in large React applications?',
   'I''m building a dashboard that requires real-time updates. Should I use Context API or Redux Toolkit?',
   'ReactFan', ARRAY['react', 'redux', 'state-management'], 'en', 38, 234),
  
  ('¿Cuál es la diferencia entre "ser" y "estar" en contextos formales?',
   'Estoy aprendiendo español y siempre me confundo con estos verbos. ¿Alguien puede explicar?',
   'SpanishLearner', ARRAY['español', 'spanish-learning', 'grammar'], 'es', 29, 312),
  
  ('जावास्क्रिप्ट में async/await कैसे काम करता है?',
   'मैं जावास्क्रिप्ट सीख रहा हूं और async/await concepts को समझने में कठिनाई हो रही है।',
   'HindiCoder', ARRAY['javascript', 'async-await', 'hindi'], 'hi', 18, 98);
