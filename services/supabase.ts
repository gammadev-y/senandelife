

import { createClient } from '@supabase/supabase-js';
import { 
    FloraPediaTableRow, 
    Fertilizer,
    FertilizerData,
    CompostingMethod,
    CompostingMethodData,
    RecentViewItem, 
    SeasonalTip,
    ActiveModuleType,
    Json,
    SeasonalTipContentType,
    ItemTypeForRecentView,
    GrowingGroundData,
    TipImage,
    UserPreferences,
    PlantJsonData,
    EventType,
    CalendarEvent as CalendarEventType
} from '../src/modules/jarden/types';

// IMPORTANT: These variables should be loaded from environment variables.
// In a real project, you would use a system like Vite's `import.meta.env`
// or another environment variable solution. For this sandbox, we assume they
// are available on `process.env`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export interface Database {
  public: {
    Tables: {
      flora_pedia: {
        Row: FloraPediaTableRow
        Insert: {
            latin_name_scientific_name: string;
            common_names?: string[];
            plant_family?: string | null;
            plant_type_category?: string | null;
            description_brief?: string | null;
            cultivar_variety?: string | null;
            parent_plant_id?: string | null;
            growth_structure_habit?: string | null;
            life_cycle?: string | null;
            data?: Json | null;
        }
        Update: {
            latin_name_scientific_name?: string;
            common_names?: string[];
            plant_family?: string | null;
            plant_type_category?: string | null;
            description_brief?: string | null;
            cultivar_variety?: string | null;
            parent_plant_id?: string | null;
            growth_structure_habit?: string | null;
            life_cycle?: string | null;
            data?: Json | null;
        }
      },
      nutri_base: {
        Row: {
            id: string;
            fertilizer_name: string;
            fertilizer_id_sku?: string | null;
            type: 'Organic' | 'Synthetic' | 'Mineral' | 'Soil Amendment' | 'Other';
            form: 'Liquid' | 'Granular' | 'Powder' | 'Spike' | 'Meal' | 'Tea' | 'Other';
            data: Json | null;
            created_at: string;
            updated_at: string;
        }
        Insert: {
            fertilizer_name: string;
            fertilizer_id_sku?: string;
            type: 'Organic' | 'Synthetic' | 'Mineral' | 'Soil Amendment' | 'Other';
            form: 'Liquid' | 'Granular' | 'Powder' | 'Spike' | 'Meal' | 'Tea' | 'Other';
            data?: Json | null;
        }
        Update: {
            fertilizer_name?: string;
            fertilizer_id_sku?: string;
            type?: 'Organic' | 'Synthetic' | 'Mineral' | 'Soil Amendment' | 'Other';
            form?: 'Liquid' | 'Granular' | 'Powder' | 'Spike' | 'Meal' | 'Tea' | 'Other';
            data?: Json | null;
        }
      },
      compost_corner: {
        Row: {
            id: string;
            method_name: string;
            composting_method_id?: string | null;
            primary_composting_approach: 'Aerobic (Hot Pile)' | 'Aerobic (Cold Pile)' | 'Aerobic (Tumbler)' | 'Anaerobic (Bokashi)' | 'Vermicomposting (Worm Farm)' | 'Sheet Mulching (Lasagna)' | 'Trench Composting' | 'Other';
            scale_of_operation: 'Small (Apartment/Balcony)' | 'Medium (Home Garden)' | 'Large (Homestead/Farm)' | 'Community Scale';
            produced_fertilizer_id?: string | null;
            data: Json | null;
            created_at: string;
            updated_at: string;
        }
        Insert: {
            method_name: string;
            composting_method_id?: string;
            primary_composting_approach: 'Aerobic (Hot Pile)' | 'Aerobic (Cold Pile)' | 'Aerobic (Tumbler)' | 'Anaerobic (Bokashi)' | 'Vermicomposting (Worm Farm)' | 'Sheet Mulching (Lasagna)' | 'Trench Composting' | 'Other';
            scale_of_operation: 'Small (Apartment/Balcony)' | 'Medium (Home Garden)' | 'Large (Homestead/Farm)' | 'Community Scale';
            produced_fertilizer_id?: string;
            data?: Json | null;
        }
        Update: {
            method_name?: string;
            composting_method_id?: string;
            primary_composting_approach?: 'Aerobic (Hot Pile)' | 'Aerobic (Cold Pile)' | 'Aerobic (Tumbler)' | 'Anaerobic (Bokashi)' | 'Vermicomposting (Worm Farm)' | 'Sheet Mulching (Lasagna)' | 'Trench Composting' | 'Other';
            scale_of_operation?: 'Small (Apartment/Balcony)' | 'Medium (Home Garden)' | 'Large (Homestead/Farm)' | 'Community Scale';
            produced_fertilizer_id?: string;
            data?: Json | null;
        }
      },
      growing_grounds: {
        Row: { id: string; name: string; user_id: string; data: Json | null; created_at: string; updated_at: string; }
        Insert: { name: string; user_id: string; data?: Json | null; }
        Update: { name?: string; data?: Json | null; }
      },
      user_view_history: {
          Row: RecentViewItem & { user_id: string };
          Insert: {
            user_id: string;
            item_id: string;
            item_type: ItemTypeForRecentView;
            item_name: string;
            item_image_url: string | null;
            item_module_id: ActiveModuleType;
            viewed_at: string;
          }
          Update: {
            user_id?: string;
            item_id?: string;
            item_type?: ItemTypeForRecentView;
            item_name?: string;
            item_image_url?: string | null;
            item_module_id?: ActiveModuleType;
            viewed_at?: string;
          }
      },
      seasonal_tips: {
          Row: {
            id: string;
            title: string;
            description: string | null;
            content_type: SeasonalTipContentType;
            source_url: string | null;
            article_markdown_content: string | null;
            images: Json;
            tags: string[] | null;
            author_name: string | null;
            published_at: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            title: string;
            description?: string | null;
            content_type: SeasonalTipContentType;
            source_url?: string | null;
            article_markdown_content?: string | null;
            images: Json;
            tags?: string[];
            author_name?: string | null;
            published_at?: string;
          }
          Update: {
            title?: string;
            description?: string | null;
            content_type?: SeasonalTipContentType;
            source_url?: string | null;
            article_markdown_content?: string | null;
            images?: Json;
            tags?: string[];
            author_name?: string | null;
            published_at?: string;
          }
      },
      user_profiles: {
          Row: {
              id: string; // fk to auth.users.id
              preferences: Json | null;
              updated_at: string | null;
          }
          Insert: { id: string; preferences?: Json | null; }
          Update: { id?: string; preferences?: Json | null; }
      },
      event_types: {
        Row: EventType;
        Insert: Omit<EventType, 'id'>;
        Update: Partial<Omit<EventType, 'id'>>;
      },
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          event_type_id: string | null;
          is_recurring: boolean | null;
          recurrence_rule: string | null;
          is_completed: boolean;
          related_module: string | null;
          related_entry_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          event_type_id?: string | null;
          is_recurring?: boolean | null;
          recurrence_rule?: string | null;
          is_completed?: boolean;
          related_module?: string | null;
          related_entry_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          event_type_id?: string | null;
          is_recurring?: boolean | null;
          recurrence_rule?: string | null;
          is_completed?: boolean;
          related_module?: string | null;
          related_entry_id?: string | null;
        };
      },
      growing_ground_events: {
        Row: { id: string; growing_ground_id: string; calendar_event_id: string; created_at: string; };
        Insert: { growing_ground_id: string; calendar_event_id: string; };
        Update: never;
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