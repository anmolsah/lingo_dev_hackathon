import { supabase } from '../lib/supabase';

// Mock data for when Supabase is not configured
const mockQuestions = [
  {
    id: '1',
    title: 'How do I handle unicode strings effectively in Python 3 across different operating systems?',
    body: 'I\'m working on a cross-platform application that needs to handle text in multiple languages including Chinese, Arabic, and Hindi. What are the best practices for encoding and decoding?',
    author_name: 'CodeMaster',
    tags: ['python', 'unicode', 'cross-platform'],
    votes: 42,
    answers_count: 3,
    views: 156,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    original_language: 'en',
  },
  {
    id: '2',
    title: 'Best practices for managing state in large React applications when using Context API vs Redux?',
    body: 'I\'m building a dashboard that requires real-time updates and I\'m unsure if Context API will cause unnecessary re-renders compared to Redux Toolkit. What should I consider?',
    author_name: 'ReactFan',
    tags: ['react', 'redux', 'context-api', 'state-management'],
    votes: 38,
    answers_count: 5,
    views: 234,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    original_language: 'en',
  },
  {
    id: '3',
    title: '¿Cuál es la diferencia entre "ser" y "estar" en contextos formales?',
    body: 'Estoy aprendiendo español y siempre me confundo con estos verbos. ¿Alguien puede explicar cuándo usar cada uno en situaciones de negocios?',
    author_name: 'SpanishLearner',
    tags: ['español', 'spanish-learning', 'grammar'],
    votes: 29,
    answers_count: 6,
    views: 312,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    original_language: 'es',
  },
  {
    id: '4',
    title: 'Difference between "wissen" and "kennen" in daily conversation?',
    body: 'I keep getting these two mixed up. Can someone explain the nuance when talking about people versus facts? Any tips for remembering?',
    author_name: 'GermanLearner',
    tags: ['deutsch', 'german-learning', 'vocabulary'],
    votes: 25,
    answers_count: 4,
    views: 189,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    original_language: 'en',
  },
  {
    id: '5',
    title: 'How to center a div horizontally and vertically using Grid vs Flexbox?',
    body: 'I know justify-content: center and align-items: center work for flex, but what is the equivalent shorthand for CSS Grid? Looking for the cleanest solution.',
    author_name: 'CSSNinja',
    tags: ['css', 'flexbox', 'css-grid', 'web-dev'],
    votes: 67,
    answers_count: 8,
    views: 445,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    original_language: 'en',
  },
  {
    id: '6',
    title: 'जावास्क्रिप्ट में async/await कैसे काम करता है?',
    body: 'मैं जावास्क्रिप्ट सीख रहा हूं और async/await concepts को समझने में कठिनाई हो रही है। कोई हिंदी में समझा सकता है?',
    author_name: 'HindiCoder',
    tags: ['javascript', 'async-await', 'hindi'],
    votes: 18,
    answers_count: 2,
    views: 98,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    original_language: 'hi',
  },
];

/**
 * Format relative time from date
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

/**
 * Transform database row to question object
 */
function transformQuestion(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    author: { name: row.author_name },
    tags: row.tags || [],
    votes: row.votes || 0,
    answers: row.answers_count || 0,
    views: row.views || 0,
    createdAt: formatRelativeTime(row.created_at),
    originalLanguage: row.original_language || 'en',
  };
}

/**
 * Get all questions
 */
export async function getQuestions(filter = 'newest') {
  // If Supabase is not configured, return mock data
  if (!supabase) {
    console.log('Using mock data (Supabase not configured)');
    const sorted = [...mockQuestions];
    
    switch (filter) {
      case 'trending':
        sorted.sort((a, b) => b.votes - a.votes);
        break;
      case 'unanswered':
        return sorted.filter(q => q.answers_count === 0).map(transformQuestion);
      default:
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return sorted.map(transformQuestion);
  }

  let query = supabase.from('questions').select('*');

  switch (filter) {
    case 'trending':
      query = query.order('votes', { ascending: false });
      break;
    case 'unanswered':
      query = query.eq('answers_count', 0).order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.limit(20);

  if (error) {
    console.error('Error fetching questions:', error);
    return mockQuestions.map(transformQuestion);
  }

  return data.map(transformQuestion);
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(id) {
  if (!supabase) {
    const question = mockQuestions.find(q => q.id === id);
    return question ? transformQuestion(question) : null;
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching question:', error);
    return null;
  }

  return transformQuestion(data);
}

/**
 * Create a new question
 */
export async function createQuestion(questionData) {
  if (!supabase) {
    console.log('Mock: Creating question', questionData);
    const newQuestion = {
      id: String(mockQuestions.length + 1),
      ...questionData,
      votes: 0,
      answers_count: 0,
      views: 0,
      created_at: new Date().toISOString(),
    };
    mockQuestions.unshift(newQuestion);
    return transformQuestion(newQuestion);
  }

  const { data, error } = await supabase
    .from('questions')
    .insert([{
      title: questionData.title,
      body: questionData.body,
      author_name: questionData.author_name || 'Anonymous',
      tags: questionData.tags,
      original_language: questionData.original_language || 'en',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating question:', error);
    throw error;
  }

  return transformQuestion(data);
}

/**
 * Subscribe to realtime question updates
 */
export function subscribeToQuestions(callback) {
  if (!supabase) {
    console.log('Realtime not available without Supabase');
    return () => {};
  }

  const subscription = supabase
    .channel('questions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
