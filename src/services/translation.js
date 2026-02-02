import { LingoDotDevEngine } from "lingo.dev/sdk";

// Initialize the Lingo.dev engine
// API key should be set in environment variable VITE_LINGODOTDEV_API_KEY
const lingoDotDev = new LingoDotDevEngine({
  apiKey: import.meta.env.VITE_LINGODOTDEV_API_KEY,
});

/**
 * Translate a single text string
 * @param {string} text - Text to translate
 * @param {string} sourceLocale - Source language code (e.g., 'en')
 * @param {string} targetLocale - Target language code (e.g., 'es')
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, sourceLocale, targetLocale) {
  if (sourceLocale === targetLocale) return text;
  
  try {
    const translated = await lingoDotDev.localizeText(text, {
      sourceLocale,
      targetLocale,
    });
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
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
  
  try {
    const translated = await lingoDotDev.localizeObject(obj, {
      sourceLocale,
      targetLocale,
    });
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return obj; // Fallback to original object
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
  try {
    const results = await lingoDotDev.batchLocalizeText(text, {
      sourceLocale,
      targetLocales,
    });
    return results;
  } catch (error) {
    console.error('Batch translation error:', error);
    // Return original text for all locales
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
  try {
    const locale = await lingoDotDev.recognizeLocale(text);
    return locale;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
}

/**
 * Translate a question object (title + body)
 * @param {Object} question - Question object with title and body
 * @param {string} targetLocale - Target language code
 * @returns {Promise<Object>} - Object with translated title and body
 */
export async function translateQuestion(question, targetLocale) {
  if (question.originalLanguage === targetLocale) {
    return null; // No translation needed
  }
  
  try {
    const translated = await lingoDotDev.localizeObject(
      { title: question.title, body: question.body },
      {
        sourceLocale: question.originalLanguage,
        targetLocale,
      }
    );
    return translated;
  } catch (error) {
    console.error('Question translation error:', error);
    return null;
  }
}

export default lingoDotDev;
