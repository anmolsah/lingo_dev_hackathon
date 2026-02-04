/**
 * Notifications Service
 * Handles user notifications
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

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Get all notifications for current user
 */
export async function getNotifications(limit = 20) {
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data.map(n => ({
    ...n,
    createdAt: formatRelativeTime(n.created_at),
  }));
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  if (!supabase) return 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
}

/**
 * Create a notification
 */
export async function createNotification(userId, type, title, body = null, link = null) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      title,
      body,
      link,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Subscribe to realtime notifications
 */
export function subscribeToNotifications(callback) {
  if (!supabase) return () => {};

  const setupSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return () => {};

    const subscription = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => callback(payload.new)
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  let unsubscribe = () => {};
  setupSubscription().then(fn => { unsubscribe = fn; });
  
  return () => unsubscribe();
}

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  subscribeToNotifications,
};
