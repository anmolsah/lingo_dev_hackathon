# Vaani - Civic Empowerment Portal

**"Voice for the Voiceless" - Democratizing Access to Legal and Civic Information**

Vaani (meaning "Voice" in several Indian languages) is an AI-powered multilingual portal that bridges the linguistic divide in India's legal and civic sectors. Built for the Lingo.dev 2026 Multilingual Hackathon, Vaani makes complex legal documents and government schemes accessible to non-English speaking populations across India's 22 official languages.

## The Problem

- **46+ million pending cases** in Indian judiciary, with most proceedings in English
- **80% of Indian users** prefer vernacular content, yet most civic services are English-first
- **Legal gobbledygook** prevents self-representation and equal access to justice
- **Government schemes** remain inaccessible due to language barriers, especially in rural areas

## The Solution

Vaani provides three core modules that leverage the complete Lingo.dev ecosystem:

### 1. Plain Language Legal Summarizer

Upload legal notices or contracts → AI strips away complex jargon → Translated into your native language

### 2. Multilingual Scheme Navigator

Searchable database of government schemes → Localized in regional dialects → Eligibility checking in your language

### 3. Grassroots Legal Aid Bot

Real-time chat interface → Instant translation → Connect with legal information in your mother tongue

## Tech Stack

### Frontend

- **React 18** with Vite for fast development
- **Lingo.dev Compiler** for zero-runtime UI localization
- **Tailwind CSS** for responsive design
- **React Router** for client-side routing with locale support

### Backend

- **Supabase** (PostgreSQL) for database and authentication
- **Node.js/Express** for API endpoints
- **Lingo.dev SDK** for real-time dynamic translation

### Localiz

- **Lingo.dev CLI** for static content (Markdown schemes, JSON configs)
- **Lingo.dev Compiler** for build-time UI transformation
- **Lingo.dev SDK** for runtime translation (chat, summaries)
- **Lingo.dev MCP** for AI-assisted i18n setup

### Supported Languages (Initial)

- English, Hindi, Bengali, Telugu, Marathi, Tamil, Kannada, Gujarati, Odia, Punjabi

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│         (Lingo.dev Compiler - Zero Runtime)             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│                  API Layer (Express)                     │
│  ┌──────────────┬──────────────────┬─────────────────┐ │
│  │ Legal        │ Scheme           │ Chat            │ │
│  │ Summarizer   │ Navigator        │ Bot             │ │
│  └──────────────┴──────────────────┴─────────────────┘ │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│              Lingo.dev SDK (Runtime)                     │
│         Dynamic Translation + Language Detection         │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│                  Data Layer                              │
│  ┌──────────────┬──────────────────┬─────────────────┐ │
│  │ Supabase     │ Static Content   │ LLM API         │ │
│  │ (PostgreSQL) │ (CLI Managed)    │ (Summarization) │ │
│  └──────────────┴──────────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
vaani/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── LegalSummarizer/ # Document upload & summary
│   │   │   ├── SchemeNavigator/ # Scheme search & filter
│   │   │   ├── ChatBot/         # Legal aid chat interface
│   │   │   └── common/          # Shared UI components
│   │   ├── pages/               # Route pages
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Helper functions
│   │   └── App.jsx              # Main app component
│   ├── vite.config.js           # Vite + Lingo.dev Compiler config
│   └── package.json
│
├── server/                      # Backend API
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   │   ├── legal.js         # Legal summarization routes
│   │   │   ├── schemes.js       # Scheme data routes
│   │   │   └── chat.js          # Chat bot routes
│   │   ├── services/            # Business logic
│   │   │   ├── lingo.js         # Lingo.dev SDK integration
│   │   │   ├── llm.js           # LLM summarization
│   │   │   └── supabase.js      # Database queries
│   │   └── index.js             # Express app entry
│   └── package.json
│
├── content/                     # Static localized content
│   ├── schemes/                 # Government scheme descriptions
│   │   ├── en/                  # English (source)
│   │   ├── hi/                  # Hindi (CLI generated)
│   │   ├── bn/                  # Bengali (CLI generated)
│   │   └── ...                  # Other languages
│   └── legal-templates/         # Common legal document templates
│
├── i18n.json                    # Lingo.dev CLI configuration
├── i18n.lock                    # Translation state lockfile
└── README.md                    # This file
```

## Key Features & Lingo.dev Integration

### Feature 1: Plain Language Legal Summarizer

**User Flow:**

1. User uploads PDF/image of legal document
2. OCR extracts text (if needed)
3. LLM simplifies legal jargon into plain language
4. Lingo.dev SDK translates summary to user's preferred language
5. User receives easy-to-understand explanation

**Lingo.dev Tool:** SDK (Runtime Translation)

**Why:** Legal summaries are generated dynamically based on user uploads, requiring real-time translation with context awareness.

**Technical Implementation:**

```javascript
import { Lingo } from '@lingo.dev/sdk';

const lingo = new Lingo({ apiKey: process.env.LINGO_API_KEY });

// After LLM generates plain language summary
const translatedSummary = await lingo.translate({
  text: plainLanguageSummary,
  targetLanguage: userPreferredLanguage,
  context: 'legal_document_summary'
});
```

### Feature 2: Multilingual Scheme Navigator

**User Flow:**

1. User browses/searches government schemes
2. Filters by category (Health, Education, Agriculture)
3. Views detailed scheme information in their language
4. Checks eligibility with dynamic feedback

**Lingo.dev Tools:**

- **CLI** for static scheme content (descriptions, eligibility criteria)
- **Compiler** for UI elements (buttons, labels, navigation)
- **SDK** for dynamic eligibility messages

**Why:** Scheme descriptions are static and known at build time (CLI), UI is predictable (Compiler), but eligibility results are dynamic (SDK).

**Technical Implementation:**

**CLI Configuration (i18n.json):**

```json
{
  "version": "1.0",
  "sourceLanguage": "en",
  "targetLanguages": ["hi", "bn", "te", "mr", "ta", "kn", "gu", "or", "pa"],
  "buckets": [
    {
      "name": "schemes",
      "include": ["content/schemes/**/*.md"],
      "format": "markdown"
    }
  ]
}
```

**Compiler Integration (vite.config.js):**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingoCompiler } from '@lingo.dev/compiler';

export default defineConfig({
  plugins: [
    react(),
    lingoCompiler({
      apiKey: process.env.LINGO_API_KEY,
      sourceLanguage: 'en',
      targetLanguages: ['hi', 'bn', 'te', 'mr', 'ta', 'kn', 'gu', 'or', 'pa']
    })
  ]
});
```

**React Component (Zero Boilerplate):**

```jsx
// No translation keys needed - Compiler handles it!
function SchemeCard({ scheme }) {
  return (
    <div className="scheme-card">
      <h3>{scheme.title}</h3>
      <p>{scheme.description}</p>
      <button>Apply Now</button>
      <button>Check Eligibility</button>
    </div>
  );
}
```

### Feature 3: Grassroots Legal Aid Bot

**User Flow:**

1. User asks legal question in their native language
2. System detects language automatically
3. Bot provides guidance in the same language
4. Conversation history maintained with translations

**Lingo.dev Tool:** SDK (Real-time Translation + Language Detection)

**Why:** Chat is inherently dynamic and user-generated, requiring instant translation with tone preservation.

**Technical Implementation:**

```javascript
import { Lingo } from '@lingo.dev/sdk';

const lingo = new Lingo({ apiKey: process.env.LINGO_API_KEY });

// Detect user's language
const detectedLanguage = await lingo.detectLanguage(userMessage);

// Translate to English for processing
const englishMessage = await lingo.translate({
  text: userMessage,
  targetLanguage: 'en'
});

// Get bot response (in English)
const botResponse = await getLegalGuidance(englishMessage);

// Translate back to user's language
const translatedResponse = await lingo.translate({
  text: botResponse,
  targetLanguage: detectedLanguage,
  context: 'legal_chat_response'
});
```

## Database Schema (Supabase)

### Schemes Table

```sql
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  ministry VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scheme_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_id UUID REFERENCES schemes(id),
  language_code VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  eligibility TEXT,
  benefits TEXT,
  how_to_apply TEXT,
  UNIQUE(scheme_id, language_code)
);

CREATE INDEX idx_scheme_translations_lang ON scheme_translations(language_code);
CREATE INDEX idx_schemes_category ON schemes(category);
```

### Chat History Table

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  language_code VARCHAR(5),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id),
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  message_text TEXT NOT NULL,
  original_language VARCHAR(5),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Legal Documents Table

```sql
CREATE TABLE legal_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  original_text TEXT,
  plain_summary TEXT,
  language_code VARCHAR(5),
  document_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Lingo.dev account (10,000 free words on Hobby plan)
- Git

### Step 1: Initialize Repository (Jan 31, 2026 after 1:30 PM IST)

```bash
# Create project directory
mkdir vaani
cd vaani

# Initialize git
git init
git add .
git commit -m "feat: initialize Vaani civic empowerment portal"
```

### Step 2: Setup Lingo.dev CLI

```bash
# Install CLI globally
npm install -g @lingo.dev/cli

# Initialize i18n configuration
npx lingo.dev@latest init

# Configure i18n.json (see configuration above)

# Run initial translation
npx lingo.dev@latest run
```

### Step 3: Setup Frontend (Vite + React)

```bash
# Create Vite project
npm create vite@latest client -- --template react
cd client

# Install dependencies
npm install
npm install @lingo.dev/compiler
npm install @supabase/supabase-js
npm install react-router-dom
npm install tailwindcss postcss autoprefixer
npm install lucide-react # For icons

# Initialize Tailwind
npx tailwindcss init -p

# Configure Lingo.dev Compiler in vite.config.js
```

### Step 4: Setup Backend (Express + Lingo.dev SDK)

```bash
# Create server directory
mkdir server
cd server
npm init -y

# Install dependencies
npm install express cors dotenv
npm install @lingo.dev/sdk
npm install @supabase/supabase-js
npm install openai # For LLM summarization
npm install multer # For file uploads
```

### Step 5: Configure Environment Variables

**client/.env:**

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

**server/.env:**

```
LINGO_API_KEY=your_lingo_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

### Step 6: Setup Supabase Database

1. Create new Supabase project
2. Run SQL schema (see Database Schema section)
3. Enable Row Level Security (RLS) policies
4. Configure authentication (optional for hackathon)

### Step 7: Populate Scheme Data

```bash
# Create scheme content files
mkdir -p content/schemes/en

# Add scheme markdown files (PM-JANMAN, Anemia Mukt Bharat, etc.)
# Run Lingo.dev CLI to translate
npx lingo.dev@latest run
```

### Step 8: Development

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

## Lingo.dev Optimization Strategies

### 1. Cost Optimization (CLI)

- **Data Cleaning:** CLI automatically filters UUIDs, dates, code snippets
- **Delta Calculation:** Only translates changed content via i18n.lock
- **Fingerprinting:** Prevents redundant API calls

### 2. Performance Optimization (SDK)

- **Batch Translation:** Group multiple strings in single API call
- **Fast Mode:** Low-latency for real-time chat
- **Caching:** Store frequently used translations

### 3. Brand Voice Consistency

- Configure glossary in Lingo.dev Dashboard
- Ensure legal terms translate consistently
- Maintain empathetic yet authoritative tone

### 4. Pseudotranslation for Development

```javascript
// vite.config.js
lingoCompiler({
  usePseudotranslator: true, // Test UI without API usage
  // ... other config
})
```

## Hackathon Compliance

### Repository Hygiene

- ✅ First commit after Jan 31, 2026 1:30 PM IST
- ✅ Frequent, descriptive commits
- ✅ Clean commit history showing incremental development
- ✅ No imported code from existing projects

### Documentation Requirements

- ✅ Comprehensive README explaining Lingo.dev usage
- ✅ Clear demonstration of CLI, Compiler, and SDK
- ✅ Video demo (1-3 minutes) showing user journey

### Judging Criteria Alignment

- **Impact:** Addresses 46M+ pending cases and digital divide
- **Creativity:** Combines legal simplification with multilingual AI
- **Technical Depth:** Full Lingo.dev stack integration
- **Real-World Problem:** Aligns with Adi Vaani and government initiatives

## Demo Video Script (1-3 minutes)

**Scene 1 (0:00-0:30):** Problem Introduction

- Show complex legal notice in English
- Highlight confusion for non-English speaker
- Display statistics: 46M pending cases, 80% prefer vernacular

**Scene 2 (0:30-1:00):** Legal Summarizer Demo

- Upload legal document
- Show AI simplification
- Display translation in Bengali/Hindi
- User understands their rights

**Scene 3 (1:00-1:45):** Scheme Navigator Demo

- User searches for agriculture schemes
- Filters by category in their language
- Checks eligibility → receives personalized result
- Discovers PM-JANMAN scheme for tribal community

**Scene 4 (1:45-2:30):** Chat Bot Demo

- User asks legal question in Telugu
- Bot responds in Telugu with guidance
- Show language detection working seamlessly

**Scene 5 (2:30-3:00):** Technical Highlight

- Quick code walkthrough showing Lingo.dev integration
- Highlight zero-boilerplate UI (Compiler)
- Show i18n.lock file demonstrating delta translations
- End with impact statement: "Making justice accessible in every language"

## Future Enhancements

- Voice input/output for low-literacy users
- Integration with government APIs (myScheme, eCourts)
- Offline mode for rural areas with poor connectivity
- Support for tribal languages (Santali, Bodo, Mizo)
- Legal document templates in regional languages
- Community forum for peer-to-peer legal support

## Contributing

This is a hackathon project built between Jan 31 - Feb 7, 2026. Contributions during the hackathon period are limited to the registered participant.

## License

MIT License - Built for Lingo.dev Multilingual Hackathon 2026

## Acknowledgments

- Lingo.dev team for the revolutionary localization platform
- Indian government's Adi Vaani initiative for inspiration
- WeMakeDevs for organizing the hackathon
- All contributors to open-source localization tools

---

**Built with ❤️ for the next billion users**

*"Technology should speak the language of the people, not the other way around."*
