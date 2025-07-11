

import { createClient } from '@supabase/supabase-js';
import { 
    FloraPediaTableRow, 
    Fertilizer, 
    CompostingMethod, 
    RecentViewItem, 
    SeasonalTip,
    ActiveModuleType
} from '../src/modules/jarden/types';

// IMPORTANT: These variables should be loaded from environment variables.
// In a real project, you would use a system like Vite's `import.meta.env`
// or another environment variable solution. For this sandbox, we assume they
// are available on `process.env`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      flora_pedia: {
        Row: FloraPediaTableRow
        Insert: Omit<FloraPediaTableRow, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<FloraPediaTableRow, "id" | "created_at" | "updated_at">>
      },
      nutri_base: {
        Row: Fertilizer
        Insert: Omit<Fertilizer, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Fertilizer, "id" | "created_at" | "updated_at">>
      },
      compost_corner: {
        Row: CompostingMethod
        Insert: Omit<CompostingMethod, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<CompostingMethod, "id" | "created_at" | "updated_at">>
      },
      growing_grounds: {
        Row: {
            id: string;
            name: string;
            user_id: string;
            data: Json;
            created_at: string;
            updated_at: string;
        }
        Insert: {
            name: string;
            user_id: string;
            data: Json;
        }
        Update: Partial<{
            name: string;
            data: Json;
        }>
      },
      user_view_history: {
          Row: RecentViewItem & { user_id: string };
          Insert: Omit<RecentViewItem, 'id'> & { user_id: string };
          Update: Partial<Omit<RecentViewItem, 'id'>>;
      },
      seasonal_tips: {
          Row: SeasonalTip;
          Insert: Omit<SeasonalTip, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<SeasonalTip, 'id' | 'created_at' | 'updated_at'>>;
      },
      user_profiles: {
          Row: {
              id: string; // fk to auth.users.id
              preferences: Json | null;
              updated_at: string | null;
          }
          Insert: {
              id: string;
              preferences?: Json | null;
          }
          Update: Partial<{
              preferences?: Json | null;
          }>
      }
    }
    Functions: {}
    Enums: {}
  }
}


if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables not set. Please provide SUPABASE_URL and SUPABASE_KEY.'
  );
  // To avoid crashing the entire app in the sandbox, we are not throwing an error,
  // but in a real app, you should throw an error to fail fast.
  // throw new Error('Supabase URL and anon key are required.');
}

// Initialize the client, but handle the case where env vars might be missing.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;