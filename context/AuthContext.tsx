
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { AuthSession, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile, WeatherLocationPreference } from '../src/modules/jarden/types';
import { getUserProfile as getUserProfileFromSupabase, updateUserProfile as updateSupabaseUserProfile } from '../src/modules/jarden/services/supabaseService';
import { LOCAL_STORAGE_WEATHER_PREF_KEY } from '../src/modules/jarden/constants';


interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<any>;
  updateProfileData: (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'preferences'>>) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetProfile = useCallback(async (userId: string) => {
    try {
      if (!supabase) {
        throw new Error("Supabase client is not available.");
      }
      const userProfile = await getUserProfileFromSupabase(userId);
      setProfile(userProfile);
      // Apply theme from fetched profile
      const theme = userProfile?.preferences?.theme || 'system';
      document.documentElement.classList.remove('dark', 'light'); // Clear previous
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else if (theme === 'light') document.documentElement.classList.add('light');
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');

      // Sync local weather preference if profile has none and local exists
      if (userProfile && !userProfile.preferences?.weather) {
        const localWeatherPrefString = localStorage.getItem(LOCAL_STORAGE_WEATHER_PREF_KEY);
        if (localWeatherPrefString) {
            try {
                const localWeatherPref = JSON.parse(localWeatherPrefString) as WeatherLocationPreference;
                const updatedPrefs = { ...userProfile.preferences, weather: localWeatherPref };
                await updateSupabaseUserProfile(userId, { preferences: updatedPrefs });
                setProfile(prev => prev ? ({ ...prev, preferences: updatedPrefs }) : null);
            } catch (e) { console.error("Error syncing local weather pref to profile:", e); }
        }
      }


    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
        console.error("Supabase client not initialized. Auth features disabled.");
        setLoading(false);
        return;
    }
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchAndSetProfile(session.user.id);
        } else {
          setProfile(null); 
          document.documentElement.classList.remove('dark', 'light');
           if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
             document.documentElement.classList.add('dark');
           }
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchAndSetProfile]);

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  };
  
  const updateProfileData = async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'preferences'>>) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedProfile = await updateSupabaseUserProfile(user.id, updates);
        setProfile(updatedProfile); // Also update local state immediately for responsiveness
        return updatedProfile;
    } catch (error) {
        console.error("Error updating profile data:", error);
        throw error;
    }
  };


  const value = {
    session, user, profile, loading, setProfile,
    signInWithGoogle, signInWithEmail, signUpWithEmail, signOut,
    updateUserPassword, updateProfileData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
