import express from 'express';
import supabase from '../services/supabase.js';

const router = express.Router();

// Get all schemes with translations
router.get('/', async (req, res) => {
    try {
        const { category, lang = 'en', limit = 20, offset = 0 } = req.query;

        let query = supabase
            .from('schemes')
            .select(`
        *,
        scheme_translations!inner(*)
      `)
            .eq('scheme_translations.language_code', lang)
            .eq('is_active', true)
            .range(offset, offset + limit - 1);

        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            data: data || [],
            total: count,
            page: Math.floor(offset / limit) + 1,
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            error: {
                code: 'DATABASE_ERROR',
                message: error.message
            }
        });
    }
});

// Get single scheme by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { lang = 'en' } = req.query;

        const { data, error } = await supabase
            .from('schemes')
            .select(`
        *,
        scheme_translations!inner(*)
      `)
            .eq('id', id)
            .eq('scheme_translations.language_code', lang)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Scheme not found'
                }
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching scheme:', error);
        res.status(500).json({
            error: {
                code: 'DATABASE_ERROR',
                message: error.message
            }
        });
    }
});

// Check eligibility (simplified version)
router.post('/check-eligibility', async (req, res) => {
    try {
        const { schemeId, userProfile, language = 'en' } = req.body;

        // Simplified eligibility check
        // In production, implement complex rule engine
        const eligible = true;
        const message = language === 'hi'
            ? 'आप इस योजना के लिए पात्र हैं।'
            : 'You are eligible for this scheme.';

        res.json({
            eligible,
            message,
            matchedCriteria: ['basic_check'],
            nextSteps: [
                language === 'hi'
                    ? 'अपने स्थानीय कार्यालय पर जाएं'
                    : 'Visit your local office'
            ]
        });
    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({
            error: {
                code: 'ELIGIBILITY_CHECK_FAILED',
                message: error.message
            }
        });
    }
});

export default router;
