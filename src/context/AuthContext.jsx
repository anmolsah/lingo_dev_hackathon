import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      if (!supabase) {
        // Mock user for demo mode
        setUser(null);
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email, password, username) {
    if (!supabase) {
      // Mock signup for demo
      console.log('Mock signup:', email, username);
      setUser({ email, user_metadata: { username } });
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) return { error };
    return { data, error: null };
  }

  async function signIn(email, password) {
    if (!supabase) {
      // Mock signin for demo
      console.log('Mock signin:', email);
      setUser({ email, user_metadata: { username: email.split('@')[0] } });
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };
    return { data, error: null };
  }

  async function signOut() {
    if (!supabase) {
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  }

  async function signInWithGoogle() {
    if (!supabase) {
      console.log('Google sign-in not available in demo mode');
      return { error: { message: 'Demo mode' } };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });

    if (error) return { error };
    return { data, error: null };
  }

  async function signInWithGithub() {
    if (!supabase) {
      console.log('GitHub sign-in not available in demo mode');
      return { error: { message: 'Demo mode' } };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });

    if (error) return { error };
    return { data, error: null };
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGithub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
