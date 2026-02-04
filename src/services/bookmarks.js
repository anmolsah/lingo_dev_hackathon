/**
 * Bookmarks Service
 * Handles user bookmarks for questions
 */
import { supabase } from '../lib/supabase';

/**
 * Get all bookmarks for current user
 */
export async function getBookmarks() {
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      created_at,
      questions (
        id,
        title,
        body,
        author_name,
        tags,
        original_language,
        votes,
        answers_count,
        views,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }

  return data.map(bookmark => ({
    id: bookmark.id,
    createdAt: bookmark.created_at,
    question: bookmark.questions,
  }));
}

/**
 * Check if a question is bookmarked
 */
export async function isBookmarked(questionId) {
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .single();

  if (error) return false;
  return !!data;
}

/**
 * Add a bookmark
 */
export async function addBookmark(questionId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to bookmark');

  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{
      user_id: user.id,
      question_id: questionId,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }

  return data;
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(questionId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to remove bookmark');

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('question_id', questionId);

  if (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
}

/**
 * Toggle bookmark (add if not exists, remove if exists)
 */
export async function toggleBookmark(questionId) {
  const bookmarked = await isBookmarked(questionId);
  
  if (bookmarked) {
    await removeBookmark(questionId);
    return false;
  } else {
    await addBookmark(questionId);
    return true;
  }
}

export default {
  getBookmarks,
  isBookmarked,
  addBookmark,
  removeBookmark,
  toggleBookmark,
};
