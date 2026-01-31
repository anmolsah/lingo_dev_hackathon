-- Vaani Database Schema
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- SCHEMES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    ministry VARCHAR(100),
    target_audience VARCHAR(100),
    budget_allocation DECIMAL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- SCHEME TRANSLATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS scheme_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT,
    full_description TEXT,
    eligibility_criteria TEXT,
    benefits TEXT,
    application_process TEXT,
    required_documents TEXT,
    contact_info TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(scheme_id, language_code)
);

-- ==========================================
-- CHAT SESSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    language_code VARCHAR(5),
    session_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- CHAT MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    message_text TEXT NOT NULL,
    original_language VARCHAR(5),
    translated_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- LEGAL SUMMARIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS legal_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    document_name VARCHAR(255),
    document_type VARCHAR(50),
    original_text TEXT,
    plain_summary TEXT,
    translated_summary TEXT,
    language_code VARCHAR(5),
    key_terms JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_scheme_translations_lang ON scheme_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_scheme_translations_scheme ON scheme_translations(scheme_id);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_active ON schemes(is_active);
CREATE INDEX IF NOT EXISTS idx_schemes_code ON schemes(scheme_code);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON chat_sessions(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_summaries_user ON legal_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_summaries_type ON legal_summaries(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_summaries_date ON legal_summaries(created_at DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_summaries ENABLE ROW LEVEL SECURITY;

-- Public read access for schemes
DROP POLICY IF EXISTS "Anyone can view schemes" ON schemes;
CREATE POLICY "Anyone can view schemes" ON schemes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view scheme translations" ON scheme_translations;
CREATE POLICY "Anyone can view scheme translations" ON scheme_translations FOR SELECT USING (true);

-- For hackathon, allow public access to all tables
DROP POLICY IF EXISTS "Public chat sessions access" ON chat_sessions;
CREATE POLICY "Public chat sessions access" ON chat_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public chat messages access" ON chat_messages;
CREATE POLICY "Public chat messages access" ON chat_messages FOR ALL USING (true);

DROP POLICY IF EXISTS "Public legal summaries access" ON legal_summaries;
CREATE POLICY "Public legal summaries access" ON legal_summaries FOR ALL USING (true);

-- Allow insert/update for schemes (needed for seeding)
DROP POLICY IF EXISTS "Allow insert schemes" ON schemes;
CREATE POLICY "Allow insert schemes" ON schemes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert scheme translations" ON scheme_translations;
CREATE POLICY "Allow insert scheme translations" ON scheme_translations FOR INSERT WITH CHECK (true);
