import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ error?: string; success?: boolean }>;
  resetPassword: (newPassword: string) => Promise<{ error?: string; success?: boolean }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabase = isSupabaseConfigured();

  // Helper to fetch user profile from public.profiles
  const fetchUserProfile = async (userId: string, userEmail?: string, userMetadata?: Record<string, any>): Promise<Profile | null> => {
    if (!isSupabase) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        return profile as Profile;
      }

      // If profile does not exist yet (e.g. freshly created auth user before trigger completes), insert/upsert profile
      const defaultProfile: Profile = {
        id: userId,
        email: userEmail || '',
        full_name: userMetadata?.full_name || (userEmail ? userEmail.split('@')[0].replace('.', ' ') : 'Campus Member'),
        role: 'student', // Secure default role
        created_at: new Date().toISOString(),
      };

      const { data: createdProfile } = await supabase
        .from('profiles')
        .upsert(defaultProfile)
        .select()
        .single();

      return (createdProfile as Profile) || defaultProfile;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  // Restore session on mount and listen to auth changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabase) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session retrieval error:', error.message);
        }

        if (session?.user && isMounted) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          );
          if (isMounted) setUser(profile);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Set up Supabase auth listener for real-time signin/signout/token refresh
    if (isSupabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          );
          if (isMounted) setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) setUser(null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isSupabase]);

  // Manually refresh profile
  const refreshProfile = async () => {
    if (!user) return;
    const refreshed = await fetchUserProfile(user.id);
    if (refreshed) setUser(refreshed);
  };

  // Sign In with email and password
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabase) {
      return {
        error: 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(
          data.user.id,
          data.user.email,
          data.user.user_metadata
        );
        setUser(profile);
      }

      setIsLoading(false);
      return {};
    } catch (err: unknown) {
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : 'Sign in failed' };
    }
  };

  // Sign Up with email, password, and full name
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error?: string; message?: string }> => {
    if (!isSupabase) {
      return {
        error: 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'student', // Secure role: never allow self-granting privileged roles
          },
        },
      });

      setIsLoading(false);

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        if (!data.session) {
          return { message: 'Registration successful! Please check your campus email to confirm your account.' };
        } else {
          const profile = await fetchUserProfile(data.user.id, data.user.email, { full_name: fullName });
          setUser(profile);
          return { message: 'Welcome to Reunify! Account created successfully.' };
        }
      }

      return {};
    } catch (err: unknown) {
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : 'Registration failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error?: string }> => {
    if (!user || !isSupabase) {
      return { error: 'Not authenticated or Supabase not connected.' };
    }

    try {
      // Role updates are strictly forbidden from client
      const safeUpdates = { ...updates };
      delete (safeUpdates as any).role;
      delete (safeUpdates as any).id;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...safeUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      if (data) {
        setUser(data as Profile);
      }

      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Profile update failed' };
    }
  };

  // Password reset request
  const requestPasswordReset = async (email: string): Promise<{ error?: string; success?: boolean }> => {
    if (!isSupabase) {
      return { error: 'Supabase is not configured.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Password reset request failed' };
    }
  };

  // Set new password
  const resetPassword = async (newPassword: string): Promise<{ error?: string; success?: boolean }> => {
    if (!isSupabase) {
      return { error: 'Supabase is not configured.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Password update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAuthenticated: Boolean(user),
        isLoading,
        isSupabaseConnected: isSupabase,
        signIn,
        signUp,
        signOut,
        updateProfile,
        requestPasswordReset,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
