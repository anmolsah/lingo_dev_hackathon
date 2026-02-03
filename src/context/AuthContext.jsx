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
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription?.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  async function checkUser() {
    try {
      if (!supabase) {
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
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        return { error: signUpError };
      }

      // If user was created, try to sign in immediately
      // This works when email confirmation is disabled
      if (signUpData.user && !signUpData.session) {
        // Email confirmation might be enabled - try to sign in anyway
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError && signInData.user) {
          setUser(signInData.user);
          return { data: signInData, error: null };
        }
        
        // If sign in fails due to unconfirmed email, still return success
        // The user just needs to confirm their email
        return { 
          data: signUpData, 
          error: null,
          needsConfirmation: true 
        };
      }

      // If we got a session directly (email confirmation disabled)
      if (signUpData.session) {
        setUser(signUpData.user);
      }

      return { data: signUpData, error: null };
    } catch (err) {
      console.error('Signup exception:', err);
      return { error: { message: err.message || 'Signup failed' } };
    }
  }

  async function signIn(email, password) {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('SignIn error:', error);
        
        // Provide more helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid email or password. Make sure you have signed up first.' } };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: { message: 'Email not confirmed. Please check your inbox or disable email confirmation in Supabase dashboard (Authentication → Providers → Email → Confirm email OFF)' } };
        }
        
        return { error };
      }

      if (data.user) {
        setUser(data.user);
      }

      return { data, error: null };
    } catch (err) {
      console.error('SignIn exception:', err);
      return { error: { message: err.message || 'Sign in failed' } };
    }
  }

  async function signOut() {
    if (!supabase) {
      setUser(null);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async function signInWithGoogle() {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) return { error };
      return { data, error: null };
    } catch (err) {
      return { error: { message: err.message || 'Google sign in failed' } };
    }
  }

  async function signInWithGithub() {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) return { error };
      return { data, error: null };
    } catch (err) {
      return { error: { message: err.message || 'GitHub sign in failed' } };
    }
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
