/**
 * Tags Service
 * Handles tag operations
 */
import { supabase } from '../lib/supabase';

/**
 * Get all tags
 */
export async function getTags() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('questions_count', { ascending: false });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data;
}

/**
 * Get trending tags (most used)
 */
export async function getTrendingTags(limit = 10) {
  if (!supabase) {
    // Return mock data if Supabase not configured
    return [
      { name: 'javascript', questions_count: 156 },
      { name: 'python', questions_count: 142 },
      { name: 'react', questions_count: 128 },
      { name: 'typescript', questions_count: 98 },
      { name: 'nodejs', questions_count: 87 },
    ];
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('questions_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trending tags:', error);
    return [];
  }

  return data;
}

/**
 * Get a single tag by name
 */
export async function getTagByName(name) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('name', name.toLowerCase())
    .single();

  if (error) {
    console.error('Error fetching tag:', error);
    return null;
  }

  return data;
}

/**
 * Create or get a tag
 */
export async function getOrCreateTag(name) {
  if (!supabase) throw new Error('Supabase not configured');

  const normalizedName = name.toLowerCase().trim();

  // Try to get existing tag
  let { data: existing } = await supabase
    .from('tags')
    .select('*')
    .eq('name', normalizedName)
    .single();

  if (existing) return existing;

  // Create new tag
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name: normalizedName }])
    .select()
    .single();

  if (error) {
    console.error('Error creating tag:', error);
    throw error;
  }

  return data;
}

/**
 * Get questions by tag
 */
export async function getQuestionsByTag(tagName, limit = 20) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .contains('tags', [tagName.toLowerCase()])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching questions by tag:', error);
    return [];
  }

  return data;
}

/**
 * Search tags
 */
export async function searchTags(query, limit = 10) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('questions_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching tags:', error);
    return [];
  }

  return data;
}

export default {
  getTags,
  getTrendingTags,
  getTagByName,
  getOrCreateTag,
  getQuestionsByTag,
  searchTags,
};
