/**
 * Lingo.dev Translation Server
 * 
 * A simple Express server that handles translation requests using the Lingo.dev SDK.
 * This runs separately from the Vite dev server and handles CORS properly.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { LingoDotDevEngine } from 'lingo.dev/sdk';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.TRANSLATION_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Lingo.dev SDK
const apiKey = process.env.VITE_LINGODOTDEV_API_KEY;

if (!apiKey) {
  console.error('❌ Missing VITE_LINGODOTDEV_API_KEY in .env file');
  process.exit(1);
}

const lingoDotDev = new LingoDotDevEngine({
  apiKey: apiKey,
});

console.log('✅ Lingo.dev SDK initialized');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Translation server is running' });
});

// Translation endpoint
app.post('/translate', async (req, res) => {
  try {
    const { content, sourceLocale, targetLocale } = req.body;

    console.log(`🌍 Translating from ${sourceLocale} to ${targetLocale}`);
    console.log('📝 Content type:', typeof content);

    if (!content) {
      return res.status(400).json({ error: 'Missing content to translate' });
    }

    if (!targetLocale) {
      return res.status(400).json({ error: 'Missing targetLocale' });
    }

    let result;

    // Check if content is a string or object
    if (typeof content === 'string') {
      // Translate simple text
      result = await lingoDotDev.localizeText(content, {
        sourceLocale: sourceLocale || 'en',
        targetLocale: targetLocale,
      });
      result = { text: result };
    } else if (typeof content === 'object' && content !== null) {
      // Translate object (preserves structure)
      result = await lingoDotDev.localizeObject(content, {
        sourceLocale: sourceLocale || 'en',
        targetLocale: targetLocale,
      });
    } else {
      result = content;
    }

    console.log('✅ Translation successful');
    res.json(result);

  } catch (error) {
    console.error('❌ Translation error:', error.message);
    res.status(500).json({ 
      error: 'Translation failed', 
      message: error.message 
    });
  }
});

// Language detection endpoint
app.post('/detect-language', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    const locale = await lingoDotDev.recognizeLocale(text);
    res.json({ locale });

  } catch (error) {
    console.error('❌ Language detection error:', error.message);
    res.status(500).json({ 
      error: 'Language detection failed', 
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════');
  console.log(`   Lingo.dev Translation Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('Endpoints:');
  console.log(`  POST /translate      - Translate text or objects`);
  console.log(`  POST /detect-language - Detect language of text`);
  console.log(`  GET  /health         - Health check`);
  console.log('');
});
