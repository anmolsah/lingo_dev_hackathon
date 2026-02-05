/**
 * Lingo.dev Translation Service
 * 
 * Connects to the local Node.js translation server for real-time translations.
 * Includes caching layer to reduce API calls and improve performance.
 * Falls back to original text if server is unavailable.
 */

import cache, { TTL } from './cache';

// Configuration
const TRANSLATION_SERVER_URL = 'http://localhost:3001';
const TRANSLATION_ENABLED = true;

/**
 * Generate cache key for translations
 */
function getCacheKey(content, sourceLocale, targetLocale) {
  return cache.generateKey('translation', sourceLocale, targetLocale, content);
}

/**
 * Call the local translation server
 */
async function callTranslateServer(content, sourceLocale, targetLocale) {
  if (!TRANSLATION_ENABLED) {
    return null;
  }

  // Check cache first
  const cacheKey = getCacheKey(content, sourceLocale, targetLocale);
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    console.log('🎯 Translation cache hit');
    return cachedResult;
  }

  try {
    const response = await fetch(`${TRANSLATION_SERVER_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        sourceLocale,
        targetLocale,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    
    // Cache the successful result
    cache.set(cacheKey, result, TTL.TRANSLATION);
    console.log('💾 Translation cached');
    
    return result;
  } catch (error) {
    // Server not available - silent fail
    return null;
  }
}

/**
 * Translate a single text string
 */
export async function translateText(text, sourceLocale, targetLocale) {
  if (sourceLocale === targetLocale) return text;
  if (!text || text.trim() === '') return text;

  const result = await callTranslateServer(text, sourceLocale, targetLocale);
  return result?.text || text;
}

/**
 * Translate an object while preserving its structure
 */
export async function translateObject(obj, sourceLocale, targetLocale) {
  if (sourceLocale === targetLocale) return obj;

  const result = await callTranslateServer(obj, sourceLocale, targetLocale);
  return result || obj;
}

/**
 * Translate text to multiple languages at once
 */
export async function translateToMultiple(text, sourceLocale, targetLocales) {
  const results = {};
  for (const locale of targetLocales) {
    if (locale === sourceLocale) {
      results[locale] = text;
    } else {
      const translated = await translateText(text, sourceLocale, locale);
      results[locale] = translated;
    }
  }
  return results;
}

/**
 * Detect the language of a given text
 */
export async function detectLanguage(text) {
  // Check cache for language detection
  const cacheKey = cache.generateKey('detect', text.substring(0, 100));
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }

  try {
    const response = await fetch(`${TRANSLATION_SERVER_URL}/detect-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const result = await response.json();
      cache.set(cacheKey, result.locale, TTL.TRANSLATION);
      return result.locale;
    }
  } catch {
    // Fallback to heuristic
  }

  // Simple heuristic fallback
  let locale = 'en';
  if (/[\u4e00-\u9fa5]/.test(text)) locale = 'zh';
  else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) locale = 'ja';
  else if (/[\u0600-\u06ff]/.test(text)) locale = 'ar';
  else if (/[\u0900-\u097f]/.test(text)) locale = 'hi';
  else if (/[\uac00-\ud7af]/.test(text)) locale = 'ko';
  else if (/[áéíóúüñ¿¡]/i.test(text)) locale = 'es';
  else if (/[àâäçèéêëîïôùûüœæ]/i.test(text)) locale = 'fr';
  else if (/[äöüß]/i.test(text)) locale = 'de';
  
  return locale;
}

/**
 * Translate a question object (title + body)
 */
export async function translateQuestion(question, targetLocale) {
  if (!question || question.originalLanguage === targetLocale) {
    return null;
  }

  const sourceLocale = question.originalLanguage || 'en';
  return await callTranslateServer(
    { title: question.title, body: question.body },
    sourceLocale,
    targetLocale
  );
}

/**
 * Clear all translation cache
 */
export function clearTranslationCache() {
  cache.clearByPrefix('translation');
  cache.clearByPrefix('detect');
  console.log('🗑️ Translation cache cleared');
}

export function isReady() {
  return TRANSLATION_ENABLED;
}

export default { translateText, translateObject, translateToMultiple, detectLanguage, translateQuestion, clearTranslationCache, isReady };
