/**
 * Badges Service
 * Handles badge operations
 */
import { supabase } from '../lib/supabase';

/**
 * Get all available badges
 */
export async function getAllBadges() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('requirement_count', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data;
}

/**
 * Get badges earned by a user
 */
export async function getUserBadges(userId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      id,
      earned_at,
      badges (
        id,
        name,
        description,
        icon,
        color
      )
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }

  return data.map(ub => ({
    ...ub.badges,
    earnedAt: ub.earned_at,
  }));
}

/**
 * Get current user's badges
 */
export async function getMyBadges() {
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return getUserBadges(user.id);
}

/**
 * Check if user has earned a specific badge
 */
export async function hasBadge(userId, badgeId) {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (error) return false;
  return !!data;
}

/**
 * Award a badge to a user (internal use)
 */
export async function awardBadge(userId, badgeId) {
  if (!supabase) throw new Error('Supabase not configured');

  // Check if already has badge
  const alreadyHas = await hasBadge(userId, badgeId);
  if (alreadyHas) return null;

  const { data, error } = await supabase
    .from('user_badges')
    .insert([{
      user_id: userId,
      badge_id: badgeId,
    }])
    .select(`
      *,
      badges (*)
    `)
    .single();

  if (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }

  return data;
}

/**
 * Check and award badges based on user activity
 */
export async function checkAndAwardBadges(userId) {
  if (!supabase) return [];

  const awardedBadges = [];

  // Get user stats
  const { count: questionsCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  const { count: answersCount } = await supabase
    .from('answers')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // Get all badges
  const badges = await getAllBadges();

  for (const badge of badges) {
    let qualifies = false;

    switch (badge.requirement_type) {
      case 'questions_asked':
        qualifies = (questionsCount || 0) >= badge.requirement_count;
        break;
      case 'answers_given':
        qualifies = (answersCount || 0) >= badge.requirement_count;
        break;
      // Add more badge types as needed
    }

    if (qualifies) {
      try {
        const awarded = await awardBadge(userId, badge.id);
        if (awarded) {
          awardedBadges.push(badge);
        }
      } catch {
        // Badge may already exist
      }
    }
  }

  return awardedBadges;
}

export default {
  getAllBadges,
  getUserBadges,
  getMyBadges,
  hasBadge,
  awardBadge,
  checkAndAwardBadges,
};
