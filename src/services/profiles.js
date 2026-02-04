/**
 * Profile Service
 * Handles user profile CRUD operations
 */
import { supabase } from '../lib/supabase';

/**
 * Get user profile by ID
 */
export async function getProfile(userId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile() {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return getProfile(user.id);
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
}

/**
 * Get user's language proficiencies
 */
export async function getUserLanguages(userId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_languages')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user languages:', error);
    return [];
  }

  return data;
}

/**
 * Add a language proficiency
 */
export async function addUserLanguage(userId, languageCode, proficiencyLevel) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('user_languages')
    .upsert({
      user_id: userId,
      language_code: languageCode,
      proficiency_level: proficiencyLevel,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding language:', error);
    throw error;
  }

  return data;
}

/**
 * Remove a language proficiency
 */
export async function removeUserLanguage(userId, languageCode) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('user_languages')
    .delete()
    .eq('user_id', userId)
    .eq('language_code', languageCode);

  if (error) {
    console.error('Error removing language:', error);
    throw error;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId) {
  if (!supabase) {
    return { questionsAsked: 0, answersGiven: 0, reputation: 0 };
  }

  // Get questions count
  const { count: questionsCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // Get answers count
  const { count: answersCount } = await supabase
    .from('answers')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // Get profile for reputation
  const profile = await getProfile(userId);

  return {
    questionsAsked: questionsCount || 0,
    answersGiven: answersCount || 0,
    reputation: profile?.reputation || 0,
  };
}

export default {
  getProfile,
  getCurrentProfile,
  updateProfile,
  getUserLanguages,
  addUserLanguage,
  removeUserLanguage,
  getUserStats,
};
