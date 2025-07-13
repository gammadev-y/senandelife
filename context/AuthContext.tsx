

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile, WeatherLocationPreference } from '../src/modules/jarden/types';
import { getUserProfile, updateUserProfile } from '../src/modules/jarden/services/supabaseService';
import { LOCAL_STORAGE_WEATHER_PREF_KEY } from '../src/modules/jarden/constants';


interface AuthContextType {
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
        console.error("Supabase client not initialized. Auth features disabled.");
        setLoading(false);
        return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            let userProfile = await getUserProfile(currentUser.id);
            
            // Sync local weather preference if profile has none and local exists
            if (userProfile && !userProfile.preferences?.weather) {
              const localWeatherPrefString = localStorage.getItem(LOCAL_STORAGE_WEATHER_PREF_KEY);
              if (localWeatherPrefString) {
                  try {
                      const localWeatherPref = JSON.parse(localWeatherPrefString) as WeatherLocationPreference;
                      const updatedPrefs = { ...userProfile.preferences, weather: localWeatherPref };
                      // Update the profile in the DB and use the returned value for this session
                      userProfile = await updateUserProfile(currentUser.id, { preferences: updatedPrefs });
                  } catch (e) { 
                      console.error("Error syncing local weather pref to profile:", e); 
                  }
              }
            }
            
            setProfile(userProfile);

            // Apply theme from profile
            const theme = userProfile?.preferences?.theme || 'system';
            document.documentElement.classList.remove('dark', 'light');
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else if (theme === 'light') {
              document.documentElement.classList.add('light');
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark');
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
            setProfile(null);
          }
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
      // Use the v2 pattern, as the `data` object contains the subscription
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once.

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName?: string) => {
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
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }, []);

  const updateUserPassword = useCallback(async (newPassword: string) => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  }, []);
  
  const updateProfileData = useCallback(async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'preferences'>>) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedProfile = await updateUserProfile(user.id, updates);
        setProfile(updatedProfile); // Also update local state immediately for responsiveness
        return updatedProfile;
    } catch (error) {
        console.error("Error updating profile data:", error);
        throw error;
    }
  }, [user]);

  const value = useMemo(() => ({
    session, user, profile, loading, setProfile,
    signInWithGoogle, signInWithEmail, signUpWithEmail, signOut,
    updateUserPassword, updateProfileData,
  }), [session, user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, updateUserPassword, updateProfileData]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};