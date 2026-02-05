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
  console.error('Missing VITE_LINGODOTDEV_API_KEY in .env file');
  process.exit(1);
}

const lingoDotDev = new LingoDotDevEngine({
  apiKey: apiKey,
});

console.log('Lingo.dev SDK initialized');

// =============================================
// Server-side Translation Cache
// =============================================
const translationCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Generate cache key from translation request
 */
function getCacheKey(content, sourceLocale, targetLocale) {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  return `${sourceLocale}:${targetLocale}:${contentStr}`;
}

/**
 * Get from cache if not expired
 */
function getFromCache(key) {
  const entry = translationCache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    translationCache.delete(key);
    return null;
  }
  
  return entry.value;
}

/**
 * Set value in cache with TTL
 */
function setInCache(key, value) {
  translationCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL
  });
}

/**
 * Periodically clean expired cache entries
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, entry] of translationCache.entries()) {
    if (now > entry.expiresAt) {
      translationCache.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

// =============================================
// Routes
// =============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Translation server is running',
    cacheSize: translationCache.size
  });
});

// Cache stats endpoint
app.get('/cache-stats', (req, res) => {
  res.json({
    size: translationCache.size,
    ttl: CACHE_TTL,
  });
});

// Clear cache endpoint
app.post('/clear-cache', (req, res) => {
  translationCache.clear();
  console.log('🗑️ Translation cache cleared');
  res.json({ message: 'Cache cleared', size: 0 });
});

// Translation endpoint
app.post('/translate', async (req, res) => {
  try {
    const { content, sourceLocale, targetLocale } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Missing content to translate' });
    }

    if (!targetLocale) {
      return res.status(400).json({ error: 'Missing targetLocale' });
    }

    // Check cache first
    const cacheKey = getCacheKey(content, sourceLocale, targetLocale);
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      console.log('🎯 Cache HIT:', sourceLocale, '→', targetLocale);
      return res.json(cachedResult);
    }

    console.log(`🌍 Translating from ${sourceLocale} to ${targetLocale}`);

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

    // Cache the result
    setInCache(cacheKey, result);
    console.log('✅ Translation successful (cached)');
    
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
  console.log(`  POST /translate       - Translate text or objects`);
  console.log(`  POST /detect-language - Detect language of text`);
  console.log(`  GET  /health          - Health check + cache size`);
  console.log(`  GET  /cache-stats     - View cache statistics`);
  console.log(`  POST /clear-cache     - Clear translation cache`);
  console.log('');
  console.log('📦 Cache: In-memory with 15-minute TTL');
  console.log('');
});
