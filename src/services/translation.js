/**
 * Lingo.dev Translation Service
 * 
 * Connects to the local Node.js translation server for real-time translations.
 * Falls back to original text if server is unavailable.
 */

// Configuration
const TRANSLATION_SERVER_URL = 'http://localhost:3001';
const TRANSLATION_ENABLED = true;

/**
 * Call the local translation server
 */
async function callTranslateServer(content, sourceLocale, targetLocale) {
  if (!TRANSLATION_ENABLED) {
    return null;
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

    return await response.json();
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
  try {
    const response = await fetch(`${TRANSLATION_SERVER_URL}/detect-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.locale;
    }
  } catch {
    // Fallback to heuristic
  }

  // Simple heuristic fallback
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';
  if (/[\u0900-\u097f]/.test(text)) return 'hi';
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  if (/[áéíóúüñ¿¡]/i.test(text)) return 'es';
  if (/[àâäçèéêëîïôùûüœæ]/i.test(text)) return 'fr';
  if (/[äöüß]/i.test(text)) return 'de';
  return 'en';
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

export function isReady() {
  return TRANSLATION_ENABLED;
}

export default { translateText, translateObject, translateToMultiple, detectLanguage, translateQuestion, isReady };
