import { supabase } from '../lib/supabase';

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
  if (!supabase) {
    console.warn('Supabase not configured. Please add your Supabase credentials to .env');
    return [];
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
    return [];
  }

  return data.map(transformQuestion);
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(id) {
  if (!supabase) {
    console.warn('Supabase not configured');
    return null;
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
    throw new Error('Supabase not configured. Please add your Supabase credentials to .env');
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
    console.warn('Realtime not available without Supabase');
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
