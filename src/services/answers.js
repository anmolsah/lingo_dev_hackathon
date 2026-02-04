/**
 * Answers Service
 * Handles answer CRUD operations
 */
import { supabase } from '../lib/supabase';

/**
 * Format relative time
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
 * Transform database row to answer object
 */
function transformAnswer(row) {
  return {
    id: row.id,
    questionId: row.question_id,
    body: row.body,
    author: { 
      id: row.author_id,
      name: row.author_name 
    },
    votes: row.votes || 0,
    isAccepted: row.is_accepted || false,
    createdAt: formatRelativeTime(row.created_at),
    originalLanguage: row.original_language || 'en',
  };
}

/**
 * Get all answers for a question
 */
export async function getAnswersByQuestionId(questionId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('votes', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching answers:', error);
    return [];
  }

  return data.map(transformAnswer);
}

/**
 * Create a new answer
 */
export async function createAnswer(answerData) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('answers')
    .insert([{
      question_id: answerData.questionId,
      body: answerData.body,
      author_id: user?.id,
      author_name: answerData.authorName || user?.email?.split('@')[0] || 'Anonymous',
      original_language: answerData.originalLanguage || 'en',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating answer:', error);
    throw error;
  }

  return transformAnswer(data);
}

/**
 * Update an answer
 */
export async function updateAnswer(answerId, updates) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('answers')
    .update({
      body: updates.body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', answerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating answer:', error);
    throw error;
  }

  return transformAnswer(data);
}

/**
 * Delete an answer
 */
export async function deleteAnswer(answerId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('answers')
    .delete()
    .eq('id', answerId);

  if (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
}

/**
 * Accept an answer (only question author can do this)
 */
export async function acceptAnswer(answerId, questionId) {
  if (!supabase) throw new Error('Supabase not configured');

  // First, unaccept any previously accepted answer
  await supabase
    .from('answers')
    .update({ is_accepted: false })
    .eq('question_id', questionId)
    .eq('is_accepted', true);

  // Accept the new answer
  const { data, error } = await supabase
    .from('answers')
    .update({ is_accepted: true })
    .eq('id', answerId)
    .select()
    .single();

  if (error) {
    console.error('Error accepting answer:', error);
    throw error;
  }

  // Update question's accepted_answer_id
  await supabase
    .from('questions')
    .update({ accepted_answer_id: answerId })
    .eq('id', questionId);

  return transformAnswer(data);
}

/**
 * Subscribe to realtime answer updates for a question
 */
export function subscribeToAnswers(questionId, callback) {
  if (!supabase) return () => {};

  const subscription = supabase
    .channel(`answers:${questionId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'answers', filter: `question_id=eq.${questionId}` },
      (payload) => callback(payload)
    )
    .subscribe();

  return () => subscription.unsubscribe();
}

export default {
  getAnswersByQuestionId,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  subscribeToAnswers,
};
