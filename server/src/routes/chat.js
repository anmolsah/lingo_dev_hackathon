import express from 'express';
import supabase from '../services/supabase.js';
import lingoService from '../services/lingo.js';

const router = express.Router();

// Create new chat session
router.post('/session', async (req, res) => {
  try {
    const { languageCode = 'en', userId = null } = req.body;
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ 
        language_code: languageCode,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      error: {
        code: 'SESSION_CREATE_FAILED',
        message: error.message 
      }
    });
  }
});

// Send message in chat
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Session ID and message are required'
        }
      });
    }

    // Detect language
    const detectedLang = await lingoService.detectLanguage(message);

    // Translate to English for processing (if not already English)
    const englishMessage = detectedLang === 'en' 
      ? message 
      : await lingoService.translateText(message, 'en');

    // Generate response (simplified - in production use LLM)
    const englishResponse = generateLegalResponse(englishMessage);

    // Translate response back to user's language
    const translatedResponse = detectedLang === 'en'
      ? englishResponse
      : await lingoService.translateText(englishResponse, detectedLang);

    // Save messages to database
    await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        role: 'user',
        message_text: message,
        original_language: detectedLang
      },
      {
        session_id: sessionId,
        role: 'assistant',
        message_text: translatedResponse,
        original_language: detectedLang
      }
    ]);

    // Update session last_message_at
    await supabase
      .from('chat_sessions')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', sessionId);

    res.json({
      response: translatedResponse,
      detectedLanguage: detectedLang,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ 
      error: {
        code: 'MESSAGE_PROCESSING_FAILED',
        message: error.message 
      }
    });
  }
});

// Get user's chat sessions
router.get('/sessions', async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query;
    
    let query = supabase
      .from('chat_sessions')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(limit);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ sessions: data || [] });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ 
      error: {
        code: 'DATABASE_ERROR',
        message: error.message 
      }
    });
  }
});

// Get messages from a session
router.get('/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    res.json({ messages: data || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      error: {
        code: 'DATABASE_ERROR',
        message: error.message 
      }
    });
  }
});

// Helper function to generate legal response
function generateLegalResponse(message) {
  // Simplified response generation
  // In production, use GPT-4 or Claude with legal knowledge base
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('rent') || lowerMessage.includes('lease')) {
    return 'A rental agreement is a legal contract between a landlord and tenant. It should include: rent amount, duration, security deposit, maintenance responsibilities, and notice period. Both parties should keep signed copies.';
  } else if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
    return 'A contract is a legally binding agreement. Key elements include: offer, acceptance, consideration, and mutual consent. Always read carefully before signing and keep copies of all documents.';
  } else if (lowerMessage.includes('court') || lowerMessage.includes('case')) {
    return 'For court matters, it\'s important to: gather all relevant documents, understand your rights, consider legal representation, and follow court procedures. Legal aid services may be available if you cannot afford a lawyer.';
  } else {
    return `I understand you're asking about: "${message}". For specific legal matters, I recommend consulting with a qualified attorney who can provide advice tailored to your situation. Would you like information about legal aid services in your area?`;
  }
}

export default router;
