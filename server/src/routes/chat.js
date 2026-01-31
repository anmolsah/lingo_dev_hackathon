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
  // Enhanced response generation with more legal scenarios
  // In production, use GPT-4 or Claude with legal knowledge base
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('arrest') || lowerMessage.includes('police') || lowerMessage.includes('custody')) {
    return `When arrested, you have these rights:

1. Right to know the reason for arrest
2. Right to remain silent - you don't have to answer questions
3. Right to legal representation - ask for a lawyer immediately
4. Right to inform family or friends about the arrest
5. Right to be produced before a magistrate within 24 hours
6. Right to fair treatment - no torture or force can be used

Important: Stay calm, don't resist arrest, but remember you have rights. Request for a lawyer from legal aid if you cannot afford one.`;
  } else if (lowerMessage.includes('rent') || lowerMessage.includes('lease') || lowerMessage.includes('landlord') || lowerMessage.includes('tenant')) {
    return `Rental/Tenant Rights Information:

1. Written agreement protects both parties
2. Security deposit should not exceed 2-3 months rent  
3. Landlord must give proper notice (usually 1-3 months) before eviction
4. You cannot be evicted without court order
5. Essential services (water, electricity) cannot be cut off
6. Repairs for major issues are usually landlord's responsibility

Keep copies of rent receipts and all communication with your landlord.`;
  } else if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
    return `Key points about contracts:

1. Both parties must be competent adults
2. Read every clause before signing
3. Oral contracts are valid but hard to prove
4. Contracts obtained by force or fraud are void
5. Always keep signed copies safe
6. Understand termination clauses and penalties

If unsure about terms, consult a lawyer before signing.`;
  } else if (lowerMessage.includes('property') || lowerMessage.includes('land') || lowerMessage.includes('inheritance')) {
    return `Property Rights Information:

1. Always verify ownership through official land records
2. Inheritance is governed by personal laws (Hindu Succession Act, Muslim Personal Law, etc.)
3. Get property registered for legal protection
4. Women have equal rights to ancestral property
5. Keep all documents (sale deed, mutation records) safely
6. Encroachment issues should be reported immediately

Consider legal consultation for property disputes.`;
  } else if (lowerMessage.includes('divorce') || lowerMessage.includes('marriage') || lowerMessage.includes('maintenance')) {
    return `Marriage/Divorce Information:

1. Mutual consent divorce is faster (6 months minimum)
2. Contested divorce requires valid grounds
3. Wife has right to maintenance during and after proceedings
4. Child custody is decided based on child's welfare
5. Joint property is typically divided equally
6. Domestic violence is a criminal offense - report immediately

Family courts provide specialized help for these matters.`;
  } else if (lowerMessage.includes('labor') || lowerMessage.includes('salary') || lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('fired')) {
    return `Worker/Labor Rights:

1. Minimum wage must be paid as per state rules
2. Written employment contract protects your rights
3. No arbitrary termination without proper notice
4. Right to safe working conditions
5. Gratuity applies after 5 years of service
6. Sexual harassment at workplace is punishable by law

File complaints with the Labor Commissioner if rights are violated.`;
  } else if (lowerMessage.includes('court') || lowerMessage.includes('case') || lowerMessage.includes('lawyer')) {
    return `Court/Legal Matters:

1. Free legal aid is available for those who qualify
2. Gather and preserve all relevant documents
3. Note down important dates and facts
4. Courts have specific procedures - follow them
5. You can represent yourself (in person) for some matters
6. Cases have limitation periods - don't delay

National Legal Services Authority (NALSA) provides free legal aid.`;
  } else if (lowerMessage.includes('consumer') || lowerMessage.includes('complaint') || lowerMessage.includes('product') || lowerMessage.includes('refund')) {
    return `Consumer Rights:

1. Right to safety from hazardous products
2. Right to be informed about product/service details
3. Right to choose from various options
4. Right to be heard - make complaints
5. Right to seek redressal for unfair practices
6. Right to consumer education

File complaints at consumer court or consumerhelpline.gov.in`;
  } else {
    return `I understand you're asking about: "${message}". 

Here's what I recommend:
1. Document all relevant information
2. Keep copies of important papers
3. For specific legal advice, consult a qualified attorney
4. Free legal aid is available through NALSA (National Legal Services Authority)
5. Many state bar councils offer free legal clinics

Would you like information about any specific legal topic like property rights, labor laws, consumer rights, or family matters?`;
  }
}

export default router;
