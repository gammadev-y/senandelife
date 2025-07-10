
// This file holds types that were previously in idbService.ts and are still needed
// (e.g., by supabaseService.ts for mapping data for list views).

export interface PlantListItemData {
  id: string;
  commonName: string;
  scientificName: string;
  imageUrl?: string | null;
  imagePosY?: number;
  family?: string | null;
  typeCategory?: string | null;
  updatedAt: string;
}

export interface SeasonalTipListItemData {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  imagePosY?: number;
  tags?: string[];
  publishedAt: string; // Keep this, could be different from created_at/updated_at
  updatedAt: string;
}
