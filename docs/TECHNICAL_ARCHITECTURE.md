# Vaani - Technical Architecture Documentation

## System Architecture Overview

Vaani is built on a modern, scalable architecture that separates concerns between presentation, business logic, and data persistence while integrating Lingo.dev's localization infrastructure at every layer.

## Architecture Layers

### 1. Presentation Layer (Client)

**Technology:** React 18 + Vite + Lingo.dev Compiler

**Responsibilities:**

- User interface rendering
- Client-side routing with locale support
- Form validation and user input handling
- Real-time chat interface
- Document upload and preview

**Key Components:**

```
client/src/
├── components/
│   ├── LegalSummarizer/
│   │   ├── DocumentUpload.jsx       # File upload with drag-drop
│   │   ├── SummaryDisplay.jsx       # Formatted summary output
│   │   └── LanguageSelector.jsx     # User language preference
│   │
│   ├── SchemeNavigator/
│   │   ├── SchemeSearch.jsx         # Search with filters
│   │   ├── SchemeCard.jsx           # Individual scheme display
│   │   ├── SchemeDetail.jsx         # Full scheme information
│   │   ├── EligibilityChecker.jsx   # Interactive eligibility form
│   │   └── CategoryFilter.jsx       # Category-based filtering
│   │
│   ├── ChatBot/
│   │   ├── ChatInterface.jsx        # Main chat UI
│   │   ├── MessageBubble.jsx        # Individual message display
│   │   ├── TypingIndicator.jsx      # Loading state
│   │   └── ChatHistory.jsx          # Previous conversations
│   │
│   └── common/
│       ├── Header.jsx               # App header with locale switcher
│       ├── Footer.jsx               # Footer with links
│       ├── LoadingSpinner.jsx       # Loading states
│       └── ErrorBoundary.jsx        # Error handling
│
├── pages/
│   ├── Home.jsx                     # Landing page
│   ├── LegalSummarizerPage.jsx      # Legal tool page
│   ├── SchemeNavigatorPage.jsx      # Schemes page
│   ├── ChatBotPage.jsx              # Chat page
│   └── About.jsx                    # About Vaani
│
├── hooks/
│   ├── useLocale.js                 # Locale management
│   ├── useTranslation.js            # Runtime translation hook
│   └── useSupabase.js               # Supabase client hook
│
├── utils/
│   ├── api.js                       # API client
│   ├── constants.js                 # App constants
│   └── validators.js                # Input validation
│
└── App.jsx                          # Root component with routing
```

**Lingo.dev Compiler Integration:**

The compiler transforms JSX at build time, eliminating the need for translation keys:

```jsx
// Source code (English)
function WelcomeMessage() {
  return (
    <div>
      <h1>Welcome to Vaani</h1>
      <p>Your voice in civic matters</p>
      <button>Get Started</button>
    </div>
  );
}

// Compiled output (Hindi) - Automatic
function WelcomeMessage() {
  return (
    <div>
      <h1>वाणी में आपका स्वागत है</h1>
      <p>नागरिक मामलों में आपकी आवाज़</p>
      <button>शुरू करें</button>
    </div>
  );
}
```

**Routing with Locale Support:**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './contexts/LocaleContext';

function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/:locale?" element={<Home />} />
          <Route path="/:locale/legal" element={<LegalSummarizerPage />} />
          <Route path="/:locale/schemes" element={<SchemeNavigatorPage />} />
          <Route path="/:locale/chat" element={<ChatBotPage />} />
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}
```

### 2. Application Layer (Server)

**Technology:** Node.js + Express + Lingo.dev SDK

**Responsibilities:**

- API endpoint management
- Business logic execution
- Authentication and authorization
- File processing (OCR, PDF parsing)
- LLM orchestration for summarization
- Real-time translation via Lingo.dev SDK

**API Structure:**

```
server/src/
├── routes/
│   ├── legal.js                     # Legal summarization endpoints
│   │   POST /api/legal/upload       # Upload document
│   │   POST /api/legal/summarize    # Generate summary
│   │   GET  /api/legal/history      # User's past summaries
│   │
│   ├── schemes.js                   # Scheme data endpoints
│   │   GET  /api/schemes            # List all schemes
│   │   GET  /api/schemes/:id        # Get scheme details
│   │   POST /api/schemes/check      # Check eligibility
│   │   GET  /api/schemes/search     # Search schemes
│   │
│   └── chat.js                      # Chat bot endpoints
│       POST /api/chat/message       # Send message
│       GET  /api/chat/sessions      # Get chat history
│       POST /api/chat/session       # Create new session
│
├── services/
│   ├── lingo.js                     # Lingo.dev SDK wrapper
│   │   - translateText()
│   │   - detectLanguage()
│   │   - batchTranslate()
│   │
│   ├── llm.js                       # LLM integration
│   │   - summarizeLegalDocument()
│   │   - generateChatResponse()
│   │   - extractKeyTerms()
│   │
│   ├── supabase.js                  # Database operations
│   │   - getSchemes()
│   │   - saveSummary()
│   │   - getChatHistory()
│   │
│   ├── ocr.js                       # Document processing
│   │   - extractTextFromPDF()
│   │   - extractTextFromImage()
│   │
│   └── eligibility.js               # Eligibility logic
│       - checkSchemeEligibility()
│       - calculateScore()
│
├── middleware/
│   ├── auth.js                      # Authentication
│   ├── errorHandler.js              # Error handling
│   ├── rateLimiter.js               # Rate limiting
│   └── validator.js                 # Request validation
│
└── index.js                         # Express app setup
```

**Lingo.dev SDK Integration:**

```javascript
// services/lingo.js
import { Lingo } from '@lingo.dev/sdk';

class LingoService {
  constructor() {
    this.client = new Lingo({
      apiKey: process.env.LINGO_API_KEY
    });
  }

  async translateText(text, targetLanguage, context = null) {
    try {
      const result = await this.client.translate({
        text,
        targetLanguage,
        context,
        preserveFormatting: true
      });
      return result.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Translation failed');
    }
  }

  async detectLanguage(text) {
    const result = await this.client.detectLanguage(text);
    return result.language;
  }

  async batchTranslate(texts, targetLanguage) {
    const result = await this.client.translateBatch({
      texts,
      targetLanguage
    });
    return result.translations;
  }
}

export default new LingoService();
```

**Legal Summarization Flow:**

```javascript
// routes/legal.js
import express from 'express';
import multer from 'multer';
import lingoService from '../services/lingo.js';
import llmService from '../services/llm.js';
import ocrService from '../services/ocr.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/summarize', upload.single('document'), async (req, res) => {
  try {
    const { targetLanguage } = req.body;
    const file = req.file;

    // Step 1: Extract text from document
    const extractedText = await ocrService.extractTextFromPDF(file.path);

    // Step 2: Generate plain language summary using LLM
    const plainSummary = await llmService.summarizeLegalDocument(extractedText);

    // Step 3: Translate summary to user's language
    const translatedSummary = await lingoService.translateText(
      plainSummary,
      targetLanguage,
      'legal_document_summary'
    );

    // Step 4: Save to database
    await supabaseService.saveSummary({
      originalText: extractedText,
      plainSummary,
      translatedSummary,
      language: targetLanguage
    });

    res.json({
      success: true,
      summary: translatedSummary,
      originalLength: extractedText.length,
      summaryLength: plainSummary.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 3. Data Layer

**Technology:** Supabase (PostgreSQL) + Static Content (Markdown)

**Responsibilities:**

- Persistent data storage
- User authentication
- Real-time subscriptions
- File storage
- Query optimization

**Database Design:**

#### Schemes Table Structure

```sql
-- Main schemes table (language-agnostic)
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  ministry VARCHAR(100),
  target_audience VARCHAR(100),
  budget_allocation DECIMAL(15, 2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Translations table (one row per language)
CREATE TABLE scheme_translations (
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

-- Indexes for performance
CREATE INDEX idx_scheme_translations_lang ON scheme_translations(language_code);
CREATE INDEX idx_scheme_translations_scheme ON scheme_translations(scheme_id);
CREATE INDEX idx_schemes_category ON schemes(category);
CREATE INDEX idx_schemes_active ON schemes(is_active);
CREATE INDEX idx_schemes_code ON schemes(scheme_code);

-- Full-text search
CREATE INDEX idx_scheme_translations_search ON scheme_translations 
USING gin(to_tsvector('english', title || ' ' || short_description));
```

#### Chat System Tables

```sql
-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  language_code VARCHAR(5) NOT NULL,
  session_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  message_text TEXT NOT NULL,
  original_language VARCHAR(5),
  translated_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
```

#### Legal Summaries Tables

```sql
-- Legal document summaries
CREATE TABLE legal_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  document_name VARCHAR(255),
  document_type VARCHAR(50),
  original_text TEXT,
  plain_summary TEXT NOT NULL,
  translated_summary TEXT NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  key_terms JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_legal_summaries_user ON legal_summaries(user_id);
CREATE INDEX idx_legal_summaries_type ON legal_summaries(document_type);
CREATE INDEX idx_legal_summaries_date ON legal_summaries(created_at DESC);
```

**Row Level Security (RLS) Policies:**

```sql
-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_summaries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own legal summaries"
  ON legal_summaries FOR SELECT
  USING (auth.uid() = user_id);

-- Schemes are public
CREATE POLICY "Anyone can view schemes"
  ON schemes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view scheme translations"
  ON scheme_translations FOR SELECT
  USING (true);
```

### 4. Content Management Layer

**Technology:** Lingo.dev CLI + Markdown Files

**Responsibilities:**

- Static content translation
- Version control for translations
- Delta-based updates
- Content validation

**Directory Structure:**

```
content/
├── schemes/
│   ├── en/                          # Source language
│   │   ├── pm-janman.md
│   │   ├── anemia-mukt-bharat.md
│   │   ├── pm-kisan.md
│   │   └── ...
│   │
│   ├── hi/                          # Hindi (CLI generated)
│   │   ├── pm-janman.md
│   │   ├── anemia-mukt-bharat.md
│   │   └── ...
│   │
│   ├── bn/                          # Bengali (CLI generated)
│   ├── te/                          # Telugu (CLI generated)
│   └── ...
│
├── legal-templates/
│   ├── en/
│   │   ├── rental-agreement.md
│   │   ├── employment-contract.md
│   │   └── power-of-attorney.md
│   └── ...
│
└── faqs/
    ├── en/
    │   ├── legal-rights.md
    │   ├── government-schemes.md
    │   └── how-to-apply.md
    └── ...
```

**Lingo.dev CLI Configuration:**

```json
{
  "version": "1.0",
  "sourceLanguage": "en",
  "targetLanguages": [
    "hi",
    "bn",
    "te",
    "mr",
    "ta",
    "kn",
    "gu",
    "or",
    "pa"
  ],
  "buckets": [
    {
      "name": "schemes",
      "include": ["content/schemes/**/*.md"],
      "exclude": ["content/schemes/**/drafts/**"],
      "format": "markdown",
      "preserveFormatting": true
    },
    {
      "name": "legal-templates",
      "include": ["content/legal-templates/**/*.md"],
      "format": "markdown"
    },
    {
      "name": "faqs",
      "include": ["content/faqs/**/*.md"],
      "format": "markdown"
    }
  ],
  "glossary": {
    "litigant": "वादी",
    "plaintiff": "वादी",
    "defendant": "प्रतिवादी",
    "jurisdiction": "अधिकार क्षेत्र"
  }
}
```

**CLI Workflow:**

```bash
# 1. Add new scheme in English
echo "# PM-JANMAN Scheme..." > content/schemes/en/pm-janman.md

# 2. Run CLI to translate
npx lingo.dev@latest run

# 3. CLI performs delta calculation
# - Hashes all source files
# - Compares with i18n.lock
# - Only translates new/changed content

# 4. Translations generated in all target languages
# content/schemes/hi/pm-janman.md
# content/schemes/bn/pm-janman.md
# etc.

# 5. Commit changes
git add content/ i18n.lock
git commit -m "feat: add PM-JANMAN scheme with translations"
```

## Data Flow Diagrams

### Legal Summarization Flow

```
┌─────────────┐
│   User      │
│  Uploads    │
│  Document   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  - File validation                      │
│  - Language selection                   │
└──────┬──────────────────────────────────┘
       │ POST /api/legal/summarize
       ▼
┌─────────────────────────────────────────┐
│  Backend API (Express)                  │
│  1. Receive file                        │
│  2. Extract text (OCR Service)          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  LLM Service (OpenAI/Claude)            │
│  - Analyze legal document               │
│  - Generate plain language summary      │
│  - Extract key terms                    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Lingo.dev SDK                          │
│  - Translate summary to target language │
│  - Preserve legal terminology           │
│  - Maintain formatting                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Supabase Database                      │
│  - Save original text                   │
│  - Save plain summary                   │
│  - Save translated summary              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend Display                       │
│  - Show translated summary              │
│  - Highlight key terms                  │
│  - Provide download option              │
└─────────────────────────────────────────┘
```

### Scheme Navigator Flow

```
┌─────────────┐
│   User      │
│  Searches   │
│  Schemes    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend (React + Compiler)            │
│  - UI in user's language (automatic)    │
│  - Search input                         │
│  - Category filters                     │
└──────┬──────────────────────────────────┘
       │ GET /api/schemes?category=health&lang=hi
       ▼
┌─────────────────────────────────────────┐
│  Backend API                            │
│  - Parse query parameters               │
│  - Build database query                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Supabase Database                      │
│  - Query schemes table                  │
│  - Join with scheme_translations        │
│  - Filter by language_code              │
│  - Apply category filter                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Static Content (CLI Managed)           │
│  - Load detailed Markdown content       │
│  - Already translated by CLI            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend Display                       │
│  - Render scheme cards                  │
│  - Show eligibility checker             │
└──────┬──────────────────────────────────┘
       │ User clicks "Check Eligibility"
       ▼
┌─────────────────────────────────────────┐
│  Eligibility Service                    │
│  - Evaluate user inputs                 │
│  - Generate eligibility result          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Lingo.dev SDK                          │
│  - Translate dynamic result message     │
│  - "You are eligible because..."        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend Display                       │
│  - Show personalized result             │
│  - Provide application link             │
└─────────────────────────────────────────┘
```

### Chat Bot Flow

```
┌─────────────┐
│   User      │
│  Sends      │
│  Message    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend Chat Interface                │
│  - Capture message                      │
│  - Display in chat bubble               │
└──────┬──────────────────────────────────┘
       │ POST /api/chat/message
       ▼
┌─────────────────────────────────────────┐
│  Backend API                            │
│  - Receive message                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Lingo.dev SDK - Language Detection     │
│  - Detect user's language automatically │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Lingo.dev SDK - Translation to English │
│  - Translate for processing             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  LLM Service (Legal Knowledge Base)     │
│  - Generate response in English         │
│  - Provide legal guidance               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Lingo.dev SDK - Translation to User    │
│  - Translate response to detected lang  │
│  - Preserve tone and context            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Supabase Database                      │
│  - Save message history                 │
│  - Store both original and translated   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend Display                       │
│  - Show bot response                    │
│  - Update chat history                  │
└─────────────────────────────────────────┘
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting:**

```javascript
// Lazy load heavy components
const LegalSummarizer = lazy(() => import('./pages/LegalSummarizerPage'));
const SchemeNavigator = lazy(() => import('./pages/SchemeNavigatorPage'));
const ChatBot = lazy(() => import('./pages/ChatBotPage'));
```

1. **Lingo.dev Compiler Benefits:**

- Zero runtime overhead (translations at build time)
- Automatic code splitting per component
- No translation library bundle size

1. **Asset Optimization:**

- Image lazy loading
- Font subsetting for Indic scripts
- Gzip compression

### Backend Optimization

1. **Caching Strategy:**

```javascript
// Redis cache for frequent translations
const cache = new Map();

async function getCachedTranslation(text, lang) {
  const key = `${text}:${lang}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const translation = await lingoService.translateText(text, lang);
  cache.set(key, translation);
  return translation;
}
```

1. **Batch Processing:**

```javascript
// Batch multiple scheme translations
const schemes = await getSchemes();
const titles = schemes.map(s => s.title);
const translations = await lingoService.batchTranslate(titles, 'hi');
```

1. **Database Query Optimization:**

- Use indexes on frequently queried columns
- Implement pagination for large result sets
- Use database views for complex joins

### Lingo.dev Optimization

1. **CLI Delta Calculation:**

- Only translates changed content
- Reduces API costs by 90%+
- Faster build times

1. **SDK Fast Mode:**

```javascript
const lingo = new Lingo({
  apiKey: process.env.LINGO_API_KEY,
  fastMode: true // Low-latency for real-time
});
```

1. **Content Fingerprinting:**

- Automatic via i18n.lock
- Prevents redundant translations
- Version control friendly

## Security Considerations

### Authentication & Authorization

- Supabase Auth for user management
- JWT tokens for API authentication
- Row Level Security (RLS) for data isolation

### Data Protection

- Encrypt sensitive legal documents at rest
- HTTPS for all API communication
- Sanitize user inputs to prevent XSS

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### File Upload Security

- Validate file types (PDF, images only)
- Limit file size (max 10MB)
- Scan for malware
- Store in isolated directory

## Monitoring & Logging

### Application Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log translation requests
logger.info('Translation request', {
  sourceLanguage: 'en',
  targetLanguage: 'hi',
  textLength: text.length,
  timestamp: new Date()
});
```

### Performance Monitoring

- Track API response times
- Monitor Lingo.dev API usage
- Database query performance
- Frontend Core Web Vitals

## Deployment Architecture

### Development Environment

- Local Vite dev server (port 5173)
- Local Express server (port 3000)
- Supabase cloud instance

### Production Environment (Recommended)

- **Frontend:** Vercel/Netlify (automatic Vite builds)
- **Backend:** Railway/Render (Node.js hosting)
- **Database:** Supabase (managed PostgreSQL)
- **CDN:** Cloudflare (static assets)

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Vaani

on:
  push:
    branches: [main]

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lingo.dev CLI
        run: |
          npm install -g @lingo.dev/cli
          npx lingo.dev@latest run
        env:
          LINGO_API_KEY: ${{ secrets.LINGO_API_KEY }}
      - name: Commit translations
        run: |
          git config user.name "Lingo Bot"
          git add content/ i18n.lock
          git commit -m "chore: update translations" || true
          git push

  deploy-frontend:
    needs: translate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build frontend
        run: |
          cd client
          npm install
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Scalability Considerations

### Horizontal Scaling

- Stateless API servers (can add more instances)
- Load balancer for traffic distribution
- Database connection pooling

### Vertical Scaling

- Upgrade server resources as needed
- Optimize database queries
- Implement caching layers

### Future Enhancements

- Microservices architecture for each module
- Message queue for async processing
- CDN for static content delivery
- Multi-region deployment

---

This architecture is designed to be hackathon-friendly (quick to build) while maintaining production-ready patterns (scalable and maintainable).
