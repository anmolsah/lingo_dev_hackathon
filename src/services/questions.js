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
    author: { 
      id: row.author_id,
      name: row.author_name 
    },
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

  // Fetch questions with answer count and votes
  let query = supabase
    .from('questions')
    .select('*, answers(count), votes:votes(vote_type)');

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

  // Transform with dynamic counts
  return data.map(row => {
    // Calculate total votes from votes array
    const voteSum = row.votes?.reduce((sum, v) => sum + (v.vote_type || 0), 0) || 0;
    
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      author: { 
        id: row.author_id,
        name: row.author_name 
      },
      tags: row.tags || [],
      votes: voteSum,  // Dynamic vote count
      answers: row.answers?.[0]?.count || 0,  // Dynamic answer count
      views: row.views || 0,
      createdAt: formatRelativeTime(row.created_at),
      originalLanguage: row.original_language || 'en',
    };
  });
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
    .select('*, votes:votes(vote_type)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching question:', error);
    return null;
  }

  // Calculate total votes
  const voteSum = data.votes?.reduce((sum, v) => sum + (v.vote_type || 0), 0) || 0;
  
  return {
    id: data.id,
    title: data.title,
    body: data.body,
    author: { 
      id: data.author_id,
      name: data.author_name 
    },
    tags: data.tags || [],
    votes: voteSum,  // Dynamic vote count
    answers: data.answers_count || 0,
    views: data.views || 0,
    createdAt: formatRelativeTime(data.created_at),
    originalLanguage: data.original_language || 'en',
  };
}

/**
 * Create a new question
 */
export async function createQuestion(questionData) {
  if (!supabase) {
    throw new Error('Supabase not configured. Please add your Supabase credentials to .env');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('questions')
    .insert([{
      title: questionData.title,
      body: questionData.body,
      author_id: user?.id,
      author_name: questionData.author_name || user?.email?.split('@')[0] || 'Anonymous',
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
 * Get questions by the current user
 */
export async function getMyQuestions() {
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching my questions:', error);
    return [];
  }

  return data.map(transformQuestion);
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
