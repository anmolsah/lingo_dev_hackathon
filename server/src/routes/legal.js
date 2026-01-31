import express from 'express';
import multer from 'multer';
import { extractTextFromPDF } from '../services/ocr.js';
import lingoService from '../services/lingo.js';
import supabase from '../services/supabase.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Summarize legal document
router.post('/summarize', upload.single('document'), async (req, res) => {
    try {
        const { targetLanguage = 'hi' } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'No file uploaded'
                }
            });
        }

        // Extract text from PDF
        const extractedText = await extractTextFromPDF(file.path);

        // Generate plain language summary (simplified version)
        // In production, use GPT-4 or Claude for better summarization
        const plainSummary = generateSimpleSummary(extractedText);

        // Translate summary to target language
        const translatedSummary = await lingoService.translateText(
            plainSummary,
            targetLanguage,
            'legal_document_summary'
        );

        // Save to database (optional)
        await supabase.from('legal_summaries').insert({
            document_name: file.originalname,
            document_type: 'legal_document',
            original_text: extractedText.substring(0, 5000), // Store first 5000 chars
            plain_summary: plainSummary,
            translated_summary: translatedSummary,
            language_code: targetLanguage
        });

        res.json({
            success: true,
            summary: translatedSummary,
            originalLength: extractedText.length,
            summaryLength: plainSummary.length,
            documentType: 'legal_document'
        });
    } catch (error) {
        console.error('Error summarizing document:', error);
        res.status(500).json({
            error: {
                code: 'PROCESSING_ERROR',
                message: error.message
            }
        });
    }
});

// Get user's legal document history
router.get('/history', async (req, res) => {
    try {
        const { userId, limit = 10, offset = 0 } = req.query;

        let query = supabase
            .from('legal_summaries')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            summaries: data || [],
            total: data?.length || 0
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            error: {
                code: 'DATABASE_ERROR',
                message: error.message
            }
        });
    }
});

// Helper function to generate simple summary
function generateSimpleSummary(text) {
    // Simplified summarization - take first 500 characters
    // In production, use LLM for intelligent summarization
    const summary = text.substring(0, 500);
    return `This is a legal document. Key points:\n\n${summary}...\n\nFor detailed legal advice, please consult a qualified attorney.`;
}

export default router;
