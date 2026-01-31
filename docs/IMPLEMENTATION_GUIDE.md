# Vaani - Step-by-Step Implementation Guide

## Hackathon Timeline: Jan 31 - Feb 7, 2026

This guide provides a day-by-day breakdown for building Vaani during the hackathon week.

## Pre-Hackathon Preparation (Before Jan 31, 1:30 PM IST)

### Account Setup

1. Create Lingo.dev account at <https://lingo.dev>
2. Create Supabase account at <https://supabase.com>
3. Get OpenAI API key (or alternative LLM provider)
4. Install required tools:
   - Node.js 18+
   - Git
   - VS Code (recommended)

### Research & Planning

- Review Lingo.dev documentation
- Study previous hackathon winners
- Prepare government scheme data sources
- Draft demo video script

## Day 1: Friday, Jan 31, 2026 (After 1:30 PM IST)

### Hour 1-2: Project Initialization

**Step 1: Create Repository**

```bash
# Create project directory
mkdir vaani
cd vaani

# Initialize git (AFTER 1:30 PM IST!)
git init
git branch -M main

# Create initial README
echo "# Vaani - Civic Empowerment Portal" > README.md
git add README.md
git commit -m "feat: initialize Vaani project"
```

**Step 2: Setup Lingo.dev CLI**

```bash
# Install CLI
npm install -g @lingo.dev/cli

# Initialize i18n configuration
npx lingo.dev@latest init

# This creates i18n.json - configure it
```

**i18n.json Configuration:**

```json
{
  "version": "1.0",
  "sourceLanguage": "en",
  "targetLanguages": ["hi", "bn", "te", "mr"],
  "buckets": [
    {
      "name": "schemes",
      "include": ["content/schemes/**/*.md"],
      "format": "markdown"
    }
  ]
}
```

**Step 3: Create Content Structure**

```bash
# Create content directories
mkdir -p content/schemes/en
mkdir -p content/legal-templates/en
mkdir -p content/faqs/en

git add .
git commit -m "chore: setup content structure and i18n config"
```

### Hour 3-4: Frontend Scaffolding

**Step 4: Create Vite + React Project**

```bash
# Create client directory
npm create vite@latest client -- --template react
cd client

# Install dependencies
npm install
npm install @lingo.dev/compiler
npm install react-router-dom
npm install @supabase/supabase-js
npm install lucide-react

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 5: Configure Lingo.dev Compiler**

Edit `client/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingoCompiler } from '@lingo.dev/compiler';

export default defineConfig({
  plugins: [
    react(),
    lingoCompiler({
      apiKey: process.env.VITE_LINGO_API_KEY,
      sourceLanguage: 'en',
      targetLanguages: ['hi', 'bn', 'te', 'mr'],
      usePseudotranslator: true // For development
    })
  ]
});
```

**Step 6: Setup Tailwind**

Edit `client/tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edit `client/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```bash
cd ..
git add client/
git commit -m "feat: setup Vite + React with Lingo.dev Compiler"
```

### Hour 5-6: Backend Scaffolding

**Step 7: Create Express Server**

```bash
# Create server directory
mkdir server
cd server
npm init -y

# Install dependencies
npm install express cors dotenv
npm install @lingo.dev/sdk
npm install @supabase/supabase-js
npm install multer
```

**Step 8: Create Basic Server Structure**

```bash
mkdir -p src/routes
mkdir -p src/services
mkdir -p src/middleware

# Create entry file
touch src/index.js
```

Edit `server/src/index.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vaani API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Update `server/package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node src/index.js"
  }
}
```

```bash
cd ..
git add server/
git commit -m "feat: setup Express server with basic structure"
```

### Hour 7-8: Supabase Setup

**Step 9: Create Supabase Project**

1. Go to <https://supabase.com>
2. Create new project
3. Wait for database provisioning
4. Copy project URL and anon key

**Step 10: Create Database Schema**

In Supabase SQL Editor, run:

```sql
-- Schemes table
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  ministry VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scheme translations
CREATE TABLE scheme_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  eligibility TEXT,
  benefits TEXT,
  UNIQUE(scheme_id, language_code)
);

-- Indexes
CREATE INDEX idx_scheme_translations_lang ON scheme_translations(language_code);
CREATE INDEX idx_schemes_category ON schemes(category);

-- RLS Policies
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schemes"
  ON schemes FOR SELECT USING (true);

CREATE POLICY "Anyone can view translations"
  ON scheme_translations FOR SELECT USING (true);
```

**Step 11: Configure Environment Variables**

Create `client/.env`:

```
VITE_LINGO_API_KEY=your_lingo_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

Create `server/.env`:

```
LINGO_API_KEY=your_lingo_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=3000
```

```bash
# Add .env to .gitignore
echo "*.env" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore

git add .gitignore
git commit -m "chore: configure environment variables"
```

### End of Day 1 Summary

✅ Project initialized with clean git history
✅ Lingo.dev CLI configured
✅ Frontend scaffolded with Compiler integration
✅ Backend scaffolded with Express
✅ Supabase database created with schema
✅ Environment variables configured

**Commit count: ~6-8 commits**

---

## Day 2: Saturday, Feb 1, 2026

### Morning: Content Creation & CLI Translation

**Step 12: Create Government Scheme Content**

Create `content/schemes/en/pm-janman.md`:

```markdown
# PM-JANMAN Scheme

## Overview
The Pradhan Mantri Janjati Adivasi Nyaya Maha Abhiyan (PM-JANMAN) is a comprehensive initiative for the welfare of Particularly Vulnerable Tribal Groups (PVTGs).

## Eligibility
- Members of recognized PVTGs
- Residing in designated tribal areas
- Indian citizens

## Benefits
- Housing assistance
- Clean drinking water
- Electricity connections
- Road connectivity
- Education support
- Healthcare facilities

## How to Apply
1. Visit your local tribal welfare office
2. Submit proof of PVTG membership
3. Fill application form
4. Attach required documents
5. Track application status online
```

Create more schemes (3-5 total for demo):

- `pm-kisan.md` (Agriculture)
- `anemia-mukt-bharat.md` (Health)
- `skill-india.md` (Education)

**Step 13: Run Lingo.dev CLI**

```bash
# Translate all content
npx lingo.dev@latest run

# This generates:
# content/schemes/hi/pm-janman.md
# content/schemes/bn/pm-janman.md
# content/schemes/te/pm-janman.md
# content/schemes/mr/pm-janman.md
# + i18n.lock file

git add content/ i18n.lock
git commit -m "feat: add government schemes with multilingual translations"
```

### Afternoon: Scheme Navigator UI

**Step 14: Create Scheme Components**

Create `client/src/components/SchemeNavigator/SchemeCard.jsx`:

```jsx
export function SchemeCard({ scheme }) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition">
      <h3 className="text-xl font-bold mb-2">{scheme.title}</h3>
      <p className="text-gray-600 mb-4">{scheme.description}</p>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          View Details
        </button>
        <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded">
          Check Eligibility
        </button>
      </div>
    </div>
  );
}
```

Create `client/src/pages/SchemeNavigatorPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { SchemeCard } from '../components/SchemeNavigator/SchemeCard';

export function SchemeNavigatorPage() {
  const [schemes, setSchemes] = useState([]);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/schemes?category=${category}`)
      .then(res => res.json())
      .then(data => setSchemes(data));
  }, [category]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Government Schemes</h1>
      
      <div className="mb-6">
        <label className="mr-2">Filter by category:</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="all">All Categories</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="agriculture">Agriculture</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map(scheme => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>
    </div>
  );
}
```

**Step 15: Create Schemes API Endpoint**

Create `server/src/routes/schemes.js`:

```javascript
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.get('/', async (req, res) => {
  try {
    const { category, lang = 'en' } = req.query;
    
    let query = supabase
      .from('schemes')
      .select(`
        *,
        scheme_translations!inner(*)
      `)
      .eq('scheme_translations.language_code', lang)
      .eq('is_active', true);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Update `server/src/index.js`:

```javascript
import schemesRoutes from './routes/schemes.js';

// ... existing code ...

app.use('/api/schemes', schemesRoutes);
```

```bash
git add .
git commit -m "feat: implement scheme navigator with multilingual support"
```

### Evening: Seed Database

**Step 16: Create Database Seeder**

Create `server/src/scripts/seed-schemes.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const schemes = [
  {
    scheme_code: 'PM_JANMAN',
    category: 'tribal_welfare',
    ministry: 'Ministry of Tribal Affairs'
  },
  {
    scheme_code: 'PM_KISAN',
    category: 'agriculture',
    ministry: 'Ministry of Agriculture'
  },
  {
    scheme_code: 'ANEMIA_MUKT_BHARAT',
    category: 'health',
    ministry: 'Ministry of Health'
  }
];

async function seedSchemes() {
  for (const scheme of schemes) {
    // Insert scheme
    const { data: schemeData, error: schemeError } = await supabase
      .from('schemes')
      .insert(scheme)
      .select()
      .single();
    
    if (schemeError) {
      console.error('Error inserting scheme:', schemeError);
      continue;
    }
    
    // Insert translations
    const languages = ['en', 'hi', 'bn', 'te', 'mr'];
    for (const lang of languages) {
      const filePath = path.join(
        process.cwd(),
        '..',
        'content',
        'schemes',
        lang,
        `${scheme.scheme_code.toLowerCase().replace(/_/g, '-')}.md`
      );
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Parse markdown (simplified)
        const lines = content.split('\n');
        const title = lines[0].replace('# ', '');
        const description = lines.slice(2, 5).join(' ');
        
        await supabase
          .from('scheme_translations')
          .insert({
            scheme_id: schemeData.id,
            language_code: lang,
            title,
            description
          });
      }
    }
    
    console.log(`Seeded scheme: ${scheme.scheme_code}`);
  }
}

seedSchemes();
```

```bash
cd server
node src/scripts/seed-schemes.js
cd ..

git add .
git commit -m "feat: add database seeder for schemes"
```

### End of Day 2 Summary

✅ Government scheme content created
✅ CLI translations generated for 4 languages
✅ Scheme Navigator UI built
✅ Schemes API endpoint implemented
✅ Database seeded with scheme data

**Commit count: ~4-5 commits**

---

## Day 3: Sunday, Feb 2, 2026

### Morning: Lingo.dev SDK Integration

**Step 17: Create Lingo Service**

Create `server/src/services/lingo.js`:

```javascript
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
        context
      });
      return result.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
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

### Afternoon: Legal Summarizer Feature

**Step 18: Setup File Upload**

```bash
cd server
npm install multer pdf-parse
```

Create `server/src/services/ocr.js`:

```javascript
import pdf from 'pdf-parse';
import fs from 'fs';

export async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}
```

**Step 19: Create Legal Summarization Endpoint**

Create `server/src/routes/legal.js`:

```javascript
import express from 'express';
import multer from 'multer';
import { extractTextFromPDF } from '../services/ocr.js';
import lingoService from '../services/lingo.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/summarize', upload.single('document'), async (req, res) => {
  try {
    const { targetLanguage } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text
    const extractedText = await extractTextFromPDF(file.path);

    // Simplified summarization (in production, use LLM)
    const plainSummary = extractedText.substring(0, 500) + '...';

    // Translate summary
    const translatedSummary = await lingoService.translateText(
      plainSummary,
      targetLanguage,
      'legal_document_summary'
    );

    res.json({
      success: true,
      summary: translatedSummary,
      originalLength: extractedText.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Update `server/src/index.js`:

```javascript
import legalRoutes from './routes/legal.js';

app.use('/api/legal', legalRoutes);
```

**Step 20: Create Legal Summarizer UI**

Create `client/src/components/LegalSummarizer/DocumentUpload.jsx`:

```jsx
import { useState } from 'react';
import { Upload } from 'lucide-react';

export function DocumentUpload({ onSummaryGenerated }) {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('targetLanguage', language);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/legal/summarize`,
        {
          method: 'POST',
          body: formData
        }
      );
      const data = await response.json();
      onSummaryGenerated(data.summary);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="mx-auto mb-4" size={48} />
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        {file && <p className="text-sm">Selected: {file.name}</p>}
      </div>

      <div>
        <label className="block mb-2">Translate to:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        >
          <option value="hi">Hindi</option>
          <option value="bn">Bengali</option>
          <option value="te">Telugu</option>
          <option value="mr">Marathi</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!file || loading}
        className="bg-blue-600 text-white px-6 py-3 rounded w-full disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Summarize & Translate'}
      </button>
    </form>
  );
}
```

Create `client/src/pages/LegalSummarizerPage.jsx`:

```jsx
import { useState } from 'react';
import { DocumentUpload } from '../components/LegalSummarizer/DocumentUpload';

export function LegalSummarizerPage() {
  const [summary, setSummary] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Legal Document Summarizer</h1>
      <p className="text-gray-600 mb-8">
        Upload a legal document and get a plain language summary in your preferred language.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Upload Document</h2>
          <DocumentUpload onSummaryGenerated={setSummary} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Summary</h2>
          {summary ? (
            <div className="border rounded-lg p-6 bg-gray-50">
              <p className="whitespace-pre-wrap">{summary}</p>
            </div>
          ) : (
            <p className="text-gray-400">Upload a document to see the summary</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

```bash
git add .
git commit -m "feat: implement legal document summarizer with SDK translation"
```

### Evening: Routing & Navigation

**Step 21: Setup React Router**

Update `client/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { LegalSummarizerPage } from './pages/LegalSummarizerPage';
import { SchemeNavigatorPage } from './pages/SchemeNavigatorPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Vaani
              </Link>
              <div className="flex gap-6">
                <Link to="/legal" className="hover:text-blue-600">
                  Legal Summarizer
                </Link>
                <Link to="/schemes" className="hover:text-blue-600">
                  Government Schemes
                </Link>
                <Link to="/chat" className="hover:text-blue-600">
                  Legal Aid Chat
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/legal" element={<LegalSummarizerPage />} />
          <Route path="/schemes" element={<SchemeNavigatorPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

Create `client/src/pages/Home.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { FileText, Search, MessageCircle } from 'lucide-react';

export function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to Vaani</h1>
        <p className="text-xl text-gray-600">
          Your voice in civic matters - Making legal and government information accessible in every language
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/legal" className="border rounded-lg p-8 hover:shadow-lg transition">
          <FileText className="mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Legal Summarizer</h2>
          <p className="text-gray-600">
            Upload legal documents and get plain language summaries in your language
          </p>
        </Link>

        <Link to="/schemes" className="border rounded-lg p-8 hover:shadow-lg transition">
          <Search className="mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Scheme Navigator</h2>
          <p className="text-gray-600">
            Discover government schemes and check your eligibility
          </p>
        </Link>

        <Link to="/chat" className="border rounded-lg p-8 hover:shadow-lg transition">
          <MessageCircle className="mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Legal Aid Chat</h2>
          <p className="text-gray-600">
            Get instant legal guidance in your native language
          </p>
        </Link>
      </div>
    </div>
  );
}
```

```bash
git add .
git commit -m "feat: add routing and home page"
```

### End of Day 3 Summary

✅ Lingo.dev SDK service created
✅ Legal summarizer with file upload
✅ PDF text extraction
✅ Real-time translation via SDK
✅ Navigation and routing setup

**Commit count: ~3-4 commits**

---

## Day 4: Monday, Feb 3, 2026

### Full Day: Chat Bot Implementation

**Step 22: Create Chat Database Tables**

In Supabase SQL Editor:

```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  language_code VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  message_text TEXT NOT NULL,
  original_language VARCHAR(5),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
```

**Step 23: Create Chat API Endpoint**

Create `server/src/routes/chat.js`:

```javascript
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import lingoService from '../services/lingo.js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    // Detect language
    const detectedLang = await lingoService.detectLanguage(message);

    // Translate to English for processing
    const englishMessage = detectedLang === 'en' 
      ? message 
      : await lingoService.translateText(message, 'en');

    // Generate response (simplified - in production use LLM)
    const englishResponse = `I understand you're asking about: "${englishMessage}". For legal matters, I recommend consulting with a qualified attorney.`;

    // Translate response back to user's language
    const translatedResponse = detectedLang === 'en'
      ? englishResponse
      : await lingoService.translateText(englishResponse, detectedLang);

    // Save messages
    await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        role: 'user',
        message_text: message,
        original_language: detectedLang
      },
      {
        session_id: sessionId,
        role: 'assistant',
        message_text: translatedResponse,
        original_language: detectedLang
      }
    ]);

    res.json({
      response: translatedResponse,
      detectedLanguage: detectedLang
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/session', async (req, res) => {
  try {
    const { languageCode } = req.body;
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ language_code: languageCode })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Update `server/src/index.js`:

```javascript
import chatRoutes from './routes/chat.js';

app.use('/api/chat', chatRoutes);
```

**Step 24: Create Chat UI**

Create `client/src/components/ChatBot/ChatInterface.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Create session on mount
    fetch(`${import.meta.env.VITE_API_URL}/api/chat/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languageCode: 'en' })
    })
      .then(res => res.json())
      .then(data => setSessionId(data.id));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: input
          })
        }
      );
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.response
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a legal question in any language..."
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

Create `client/src/pages/ChatBotPage.jsx`:

```jsx
import { ChatInterface } from '../components/ChatBot/ChatInterface';

export function ChatBotPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Legal Aid Chat</h1>
      <p className="text-gray-600 mb-8">
        Ask legal questions in your native language and get instant guidance.
      </p>

      <div className="max-w-4xl mx-auto">
        <ChatInterface />
      </div>

      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>This bot provides general information only. For specific legal advice, consult a qualified attorney.</p>
      </div>
    </div>
  );
}
```

Update `client/src/App.jsx` to include the chat route:

```jsx
import { ChatBotPage } from './pages/ChatBotPage';

// In Routes:
<Route path="/chat" element={<ChatBotPage />} />
```

```bash
git add .
git commit -m "feat: implement multilingual chat bot with language detection"
```

### End of Day 4 Summary

✅ Chat database schema created
✅ Chat API with language detection
✅ Real-time translation in chat
✅ Chat UI with message history
✅ All three core features complete!

**Commit count: ~2-3 commits**

---

## Day 5: Tuesday, Feb 4, 2026

### Morning: Polish & Optimization

**Step 25: Add Loading States & Error Handling**

Create `client/src/components/common/LoadingSpinner.jsx`:

```jsx
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

Create `client/src/components/common/ErrorBoundary.jsx`:

```jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 26: Add Locale Switcher**

Create `client/src/components/common/LocaleSwitcher.jsx`:

```jsx
import { useState } from 'react';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const [locale, setLocale] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' }
  ];

  return (
    <div className="relative">
      <button className="flex items-center gap-2 px-4 py-2 border rounded">
        <Globe size={20} />
        {languages.find(l => l.code === locale)?.name}
      </button>
      {/* Dropdown implementation */}
    </div>
  );
}
```

```bash
git add .
git commit -m "feat: add loading states and error handling"
```

### Afternoon: Testing & Bug Fixes

**Step 27: Manual Testing Checklist**

Test each feature:

- [ ] Upload PDF and get summary in different languages
- [ ] Search schemes by category
- [ ] Check eligibility for schemes
- [ ] Send chat messages in different languages
- [ ] Verify language detection works
- [ ] Test on mobile viewport
- [ ] Check all navigation links

Fix any bugs found and commit:

```bash
git add .
git commit -m "fix: resolve [specific issue]"
```

### Evening: Documentation Updates

**Step 28: Update README with Screenshots**

Add usage examples and screenshots to README.md

```bash
git add README.md
git commit -m "docs: add usage examples and screenshots"
```

### End of Day 5 Summary

✅ Loading states added
✅ Error handling implemented
✅ Locale switcher created
✅ All features tested
✅ Documentation updated

**Commit count: ~3-5 commits**

---

## Day 6: Wednesday, Feb 5, 2026

### Full Day: Demo Video & Final Polish

**Step 29: Record Demo Video**

Script (1-3 minutes):

1. **Intro (0:00-0:20):** Show problem statistics, explain Vaani
2. **Legal Summarizer (0:20-0:50):** Upload document, show translation
3. **Scheme Navigator (0:50-1:30):** Search schemes, check eligibility
4. **Chat Bot (1:30-2:10):** Ask question in Hindi, get response
5. **Technical Highlight (2:10-2:45):** Show code, explain Lingo.dev integration
6. **Outro (2:45-3:00):** Impact statement

Tools for recording:

- OBS Studio (free screen recorder)
- Loom (easy to use)
- QuickTime (Mac)

**Step 30: Create Demo Data**

Add more realistic scheme data and test documents

```bash
git add .
git commit -m "chore: add demo data for video"
```

**Step 31: Final UI Polish**

- Improve spacing and typography
- Add animations
- Optimize for mobile
- Test in different browsers

```bash
git add .
git commit -m "style: final UI polish"
```

### End of Day 6 Summary

✅ Demo video recorded
✅ Demo data added
✅ Final UI improvements
✅ Cross-browser testing

**Commit count: ~2-3 commits**

---

## Day 7: Thursday, Feb 6, 2026

### Morning: Deployment

**Step 32: Deploy Frontend to Vercel**

```bash
cd client

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, set environment variables
```

**Step 33: Deploy Backend to Railway**

1. Go to railway.app
2. Create new project
3. Connect GitHub repo
4. Set environment variables
5. Deploy

**Step 34: Update API URLs**

Update `client/.env` with production API URL

```bash
git add .
git commit -m "chore: update production URLs"
git push
```

### Afternoon: Final Submission

**Step 35: Submission Checklist**

- [ ] Repository is public on GitHub
- [ ] README is comprehensive
- [ ] Demo video is uploaded (YouTube/Loom)
- [ ] All environment variables documented
- [ ] Commit history is clean
- [ ] First commit is after Jan 31, 1:30 PM IST
- [ ] Project is deployed and accessible

**Step 36: Submit to Hackathon**

1. Go to WeMakeDevs hackathon page
2. Submit GitHub repo link
3. Submit demo video link
4. Submit deployed app link
5. Fill out project description

### End of Day 7 Summary

✅ Frontend deployed
✅ Backend deployed
✅ Final submission complete
✅ Project live and accessible

---

## Post-Hackathon: Potential Enhancements

If time permits or for future development:

1. **Voice Input/Output:** Add speech-to-text and text-to-speech
2. **Offline Mode:** PWA with service workers
3. **More Languages:** Add tribal languages (Santali, Bodo)
4. **LLM Integration:** Use GPT-4 or Claude for better summaries
5. **Government API Integration:** Connect to myScheme API
6. **Mobile Apps:** React Native versions
7. **Community Forum:** Peer-to-peer legal support
8. **Legal Templates:** Downloadable templates in regional languages

---

## Troubleshooting Common Issues

### Lingo.dev CLI Issues

```bash
# If translations fail
npx lingo.dev@latest run --verbose

# Clear cache
rm -rf .lingo-cache
```

### Compiler Issues

```bash
# If build fails
rm -rf node_modules
npm install
npm run build
```

### Supabase Connection Issues

- Check environment variables
- Verify RLS policies
- Check API keys

### File Upload Issues

- Ensure uploads/ directory exists
- Check file size limits
- Verify multer configuration

---

## Final Tips for Success

1. **Commit Frequently:** Small, descriptive commits show progress
2. **Test Early:** Don't wait until the end to test features
3. **Use Pseudotranslator:** Save API credits during development
4. **Document As You Go:** Update README throughout the week
5. **Keep It Simple:** Focus on core features, not perfection
6. **Show Impact:** Emphasize real-world problem solving
7. **Highlight Lingo.dev:** Make it clear how each tool is used

Good luck with your hackathon! 🚀
