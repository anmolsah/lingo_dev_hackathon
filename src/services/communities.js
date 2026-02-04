/**
 * Communities Service
 * Handles community operations
 */
import { supabase } from '../lib/supabase';

/**
 * Get all communities
 */
export async function getCommunities() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('members_count', { ascending: false });

  if (error) {
    console.error('Error fetching communities:', error);
    return [];
  }

  return data;
}

/**
 * Get a single community by code
 */
export async function getCommunityByCode(code) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    console.error('Error fetching community:', error);
    return null;
  }

  return data;
}

/**
 * Get user's communities
 */
export async function getUserCommunities() {
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('community_members')
    .select(`
      id,
      role,
      joined_at,
      communities (
        id,
        code,
        name,
        description,
        color,
        members_count
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching user communities:', error);
    return [];
  }

  return data.map(membership => ({
    ...membership.communities,
    role: membership.role,
    joinedAt: membership.joined_at,
  }));
}

/**
 * Check if user is a member of a community
 */
export async function isMember(communityId) {
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('community_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('community_id', communityId)
    .single();

  if (error) return false;
  return !!data;
}

/**
 * Join a community
 */
export async function joinCommunity(communityId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to join community');

  const { data, error } = await supabase
    .from('community_members')
    .insert([{
      community_id: communityId,
      user_id: user.id,
      role: 'member',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error joining community:', error);
    throw error;
  }

  // Update members count
  await supabase.rpc('increment_community_members', { community_id: communityId });

  return data;
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to leave community');

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('user_id', user.id)
    .eq('community_id', communityId);

  if (error) {
    console.error('Error leaving community:', error);
    throw error;
  }

  // Update members count
  await supabase.rpc('decrement_community_members', { community_id: communityId });
}

/**
 * Get community members
 */
export async function getCommunityMembers(communityId, limit = 10) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('community_members')
    .select(`
      id,
      role,
      joined_at,
      profiles (
        id,
        username,
        display_name,
        avatar_url,
        reputation
      )
    `)
    .eq('community_id', communityId)
    .order('joined_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching community members:', error);
    return [];
  }

  return data.map(member => ({
    ...member.profiles,
    role: member.role,
    joinedAt: member.joined_at,
  }));
}

export default {
  getCommunities,
  getCommunityByCode,
  getUserCommunities,
  isMember,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
};
