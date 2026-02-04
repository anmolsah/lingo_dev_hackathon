/**
 * Votes Service
 * Handles upvotes and downvotes on questions and answers
 */
import { supabase } from '../lib/supabase';

/**
 * Get user's vote on a question
 */
export async function getQuestionVote(questionId) {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .single();

  if (error) return null;
  return data?.vote_type;
}

/**
 * Get user's vote on an answer
 */
export async function getAnswerVote(answerId) {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('user_id', user.id)
    .eq('answer_id', answerId)
    .single();

  if (error) return null;
  return data?.vote_type;
}

/**
 * Vote on a question (upvote = 1, downvote = -1)
 * Uses upsert to handle both new votes and updates
 */
export async function voteQuestion(questionId, voteType) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to vote');

  // Use upsert - this will insert if new, update if exists
  const { data, error } = await supabase
    .from('votes')
    .upsert({
      user_id: user.id,
      question_id: questionId,
      vote_type: voteType,
    }, {
      onConflict: 'user_id,question_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Vote error:', error);
    throw error;
  }

  return data?.vote_type;
}

/**
 * Vote on an answer (upvote = 1, downvote = -1)
 */
export async function voteAnswer(answerId, voteType) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to vote');

  // Check existing vote
  const existingVote = await getAnswerVote(answerId);

  if (existingVote === voteType) {
    // Remove vote if clicking same button
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', user.id)
      .eq('answer_id', answerId);

    if (error) throw error;
    return null;
  } else if (existingVote) {
    // Update existing vote
    const { data, error } = await supabase
      .from('votes')
      .update({ vote_type: voteType })
      .eq('user_id', user.id)
      .eq('answer_id', answerId)
      .select()
      .single();

    if (error) throw error;
    return data.vote_type;
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from('votes')
      .insert([{
        user_id: user.id,
        answer_id: answerId,
        vote_type: voteType,
      }])
      .select()
      .single();

    if (error) throw error;
    return data.vote_type;
  }
}

/**
 * Upvote a question
 */
export async function upvoteQuestion(questionId) {
  return voteQuestion(questionId, 1);
}

/**
 * Downvote a question
 */
export async function downvoteQuestion(questionId) {
  return voteQuestion(questionId, -1);
}

/**
 * Upvote an answer
 */
export async function upvoteAnswer(answerId) {
  return voteAnswer(answerId, 1);
}

/**
 * Downvote an answer
 */
export async function downvoteAnswer(answerId) {
  return voteAnswer(answerId, -1);
}

export default {
  getQuestionVote,
  getAnswerVote,
  voteQuestion,
  voteAnswer,
  upvoteQuestion,
  downvoteQuestion,
  upvoteAnswer,
  downvoteAnswer,
};
