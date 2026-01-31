import { LingoDotDevEngine } from 'lingo.dev/sdk';

class LingoService {
    constructor() {
        this.engine = new LingoDotDevEngine({
            apiKey: process.env.LINGO_API_KEY
        });
    }

    async translateText(text, targetLanguage, context = null) {
        try {
            const result = await this.engine.localizeText(text, {
                sourceLocale: 'en',
                targetLocale: targetLanguage
            });
            return result;
        } catch (error) {
            console.error('Translation error:', error);
            // Return original text if translation fails
            return text;
        }
    }

    async detectLanguage(text) {
        // Basic language detection based on character patterns
        // In production, you could use a more sophisticated detection
        const hindiPattern = /[\u0900-\u097F]/;
        const bengaliPattern = /[\u0980-\u09FF]/;
        const teluguPattern = /[\u0C00-\u0C7F]/;
        const marathiPattern = /[\u0900-\u097F]/; // Devanagari
        
        if (hindiPattern.test(text)) return 'hi';
        if (bengaliPattern.test(text)) return 'bn';
        if (teluguPattern.test(text)) return 'te';
        
        return 'en'; // Default to English
    }

    async batchTranslate(texts, targetLanguage) {
        try {
            const results = await Promise.all(
                texts.map(text => this.translateText(text, targetLanguage))
            );
            return results;
        } catch (error) {
            console.error('Batch translation error:', error);
            throw new Error('Batch translation failed');
        }
    }

    async translateObject(obj, targetLanguage) {
        try {
            const result = await this.engine.localizeObject(obj, {
                sourceLocale: 'en',
                targetLocale: targetLanguage
            });
            return result;
        } catch (error) {
            console.error('Object translation error:', error);
            return obj;
        }
    }
}

export default new LingoService();

