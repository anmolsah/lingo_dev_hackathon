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
        try {
            const result = await this.client.detectLanguage(text);
            return result.language;
        } catch (error) {
            console.error('Language detection error:', error);
            return 'en'; // Default to English
        }
    }

    async batchTranslate(texts, targetLanguage) {
        try {
            const result = await this.client.translateBatch({
                texts,
                targetLanguage
            });
            return result.translations;
        } catch (error) {
            console.error('Batch translation error:', error);
            throw new Error('Batch translation failed');
        }
    }
}

export default new LingoService();
