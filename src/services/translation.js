/**
 * Lingo.dev Translation Service
 * 
 * NOTE: The Lingo.dev SDK has CORS restrictions and must be called from a server-side
 * environment. For browser-based apps, you need to either:
 * 1. Use a proxy server (recommended for production)
 * 2. Use the mock translations for development/demo
 * 
 * This service provides graceful fallbacks when the API is not available.
 */

// Check if running in browser (Lingo.dev API has CORS restrictions)
const isBrowser = typeof window !== 'undefined';

// Import SDK only if API key is configured
let lingoDotDev = null;
const apiKey = import.meta.env.VITE_LINGODOTDEV_API_KEY;

// Simple mock translation (returns original in demo mode)
function mockTranslate(text) {
  // In demo mode, just return the original text
  // In a real app with a proxy server, this would call the API
  return text;
}

/**
 * Translate a single text string
 * @param {string} text - Text to translate
 * @param {string} sourceLocale - Source language code (e.g., 'en')
 * @param {string} targetLocale - Target language code (e.g., 'es')
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, sourceLocale, targetLocale) {
  if (sourceLocale === targetLocale) return text;
  if (!text || text.trim() === '') return text;
  
  // If no API key or running in browser without proxy, use mock
  if (!apiKey || isBrowser) {
    console.log(`[Translation] Mock mode - would translate "${text.substring(0, 30)}..." to ${targetLocale}`);
    return mockTranslate(text);
  }
  
  try {
    // Lazy load SDK only when needed
    if (!lingoDotDev) {
      const { LingoDotDevEngine } = await import('lingo.dev/sdk');
      lingoDotDev = new LingoDotDevEngine({ apiKey });
    }
    
    const translated = await lingoDotDev.localizeText(text, {
      sourceLocale,
      targetLocale,
    });
    return translated;
  } catch (error) {
    console.warn('Translation failed, using original text:', error.message);
    return text;
  }
}

/**
 * Translate an object while preserving its structure
 * @param {Object} obj - Object to translate
 * @param {string} sourceLocale - Source language code
 * @param {string} targetLocale - Target language code
 * @returns {Promise<Object>} - Translated object
 */
export async function translateObject(obj, sourceLocale, targetLocale) {
  if (sourceLocale === targetLocale) return obj;
  
  // Mock mode - return original object
  if (!apiKey || isBrowser) {
    console.log(`[Translation] Mock mode - would translate object to ${targetLocale}`);
    return obj;
  }
  
  try {
    if (!lingoDotDev) {
      const { LingoDotDevEngine } = await import('lingo.dev/sdk');
      lingoDotDev = new LingoDotDevEngine({ apiKey });
    }
    
    const translated = await lingoDotDev.localizeObject(obj, {
      sourceLocale,
      targetLocale,
    });
    return translated;
  } catch (error) {
    console.warn('Object translation failed:', error.message);
    return obj;
  }
}

/**
 * Translate text to multiple languages at once
 * @param {string} text - Text to translate
 * @param {string} sourceLocale - Source language code
 * @param {string[]} targetLocales - Array of target language codes
 * @returns {Promise<Object>} - Object with translations keyed by locale
 */
export async function translateToMultiple(text, sourceLocale, targetLocales) {
  // Mock mode
  if (!apiKey || isBrowser) {
    return targetLocales.reduce((acc, locale) => {
      acc[locale] = text;
      return acc;
    }, {});
  }
  
  try {
    if (!lingoDotDev) {
      const { LingoDotDevEngine } = await import('lingo.dev/sdk');
      lingoDotDev = new LingoDotDevEngine({ apiKey });
    }
    
    const results = await lingoDotDev.batchLocalizeText(text, {
      sourceLocale,
      targetLocales,
    });
    return results;
  } catch (error) {
    console.warn('Batch translation failed:', error.message);
    return targetLocales.reduce((acc, locale) => {
      acc[locale] = text;
      return acc;
    }, {});
  }
}

/**
 * Detect the language of a given text
 * @param {string} text - Text to analyze
 * @returns {Promise<string>} - Detected language code
 */
export async function detectLanguage(text) {
  // Mock mode - detect based on simple character analysis
  if (!apiKey || isBrowser) {
    // Simple heuristic detection
    if (/[\u4e00-\u9fa5]/.test(text)) return 'zh'; // Chinese
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'; // Japanese
    if (/[\u0600-\u06ff]/.test(text)) return 'ar'; // Arabic
    if (/[\u0900-\u097f]/.test(text)) return 'hi'; // Hindi
    if (/[\uac00-\ud7af]/.test(text)) return 'ko'; // Korean
    if (/[áéíóúüñ¿¡]/i.test(text)) return 'es'; // Spanish
    if (/[àâäçèéêëîïôùûüœæ]/i.test(text)) return 'fr'; // French
    if (/[äöüß]/i.test(text)) return 'de'; // German
    return 'en'; // Default to English
  }
  
  try {
    if (!lingoDotDev) {
      const { LingoDotDevEngine } = await import('lingo.dev/sdk');
      lingoDotDev = new LingoDotDevEngine({ apiKey });
    }
    
    const locale = await lingoDotDev.recognizeLocale(text);
    return locale;
  } catch (error) {
    console.warn('Language detection failed:', error.message);
    return 'en';
  }
}

/**
 * Translate a question object (title + body)
 * @param {Object} question - Question object with title and body
 * @param {string} targetLocale - Target language code
 * @returns {Promise<Object|null>} - Object with translated title and body, or null
 */
export async function translateQuestion(question, targetLocale) {
  if (!question || question.originalLanguage === targetLocale) {
    return null;
  }
  
  // Mock mode - return null (show original)
  if (!apiKey || isBrowser) {
    console.log(`[Translation] Mock mode - question translation to ${targetLocale} skipped`);
    return null;
  }
  
  try {
    if (!lingoDotDev) {
      const { LingoDotDevEngine } = await import('lingo.dev/sdk');
      lingoDotDev = new LingoDotDevEngine({ apiKey });
    }
    
    const translated = await lingoDotDev.localizeObject(
      { title: question.title, body: question.body },
      {
        sourceLocale: question.originalLanguage || 'en',
        targetLocale,
      }
    );
    return translated;
  } catch (error) {
    console.warn('Question translation failed:', error.message);
    return null;
  }
}

export default { translateText, translateObject, translateToMultiple, detectLanguage, translateQuestion };
