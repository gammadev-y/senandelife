
import { Plant, Fertilizer, CompostingMethod } from '../types';

// This data is based on your previous constants.tsx INITIAL_PLANTS, etc.
// It's structured to match the frontend Plant type which mapPlantToFloraPediaRow expects.

export const INITIAL_PLANTS_DATA_FOR_SEEDING: Partial<Plant>[] = [
  {
    id: 'seed-rose-1', // Temporary ID for seeding, Supabase will generate UUID
    display_image_url: 'https://images.unsplash.com/photo-1597362924806-111709535975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    image_object_position_y: 50,
    latin_name_scientific_name: 'Rosa spp.', // This will be used for ON CONFLICT
    common_names: ['Rose'],
    plant_family: 'Rosaceae',
    plant_type_category: 'Deciduous shrub/climber',
    description_brief: 'Roses are iconic flowering plants known for their beautiful and often fragrant blooms, with thorny stems and diverse growth habits.',
    cultivar_variety: 'Various (e.g., Hybrid Tea, Floribunda, Shrub Rose)',
    growth_structure_habit: 'Shrub, Climber',
    life_cycle: 'Perennial - Deciduous',
    plant_identification_overview: {
        common_names: ['Rose'],
        latin_name_scientific_name: 'Rosa spp.',
        plant_family: 'Rosaceae',
        plant_type_category: 'Deciduous shrub/climber',
        description_brief: 'Roses are iconic flowering plants known for their beautiful and often fragrant blooms, with thorny stems and diverse growth habits.',
        cultivar_variety: 'Various (e.g., Hybrid Tea, Floribunda, Shrub Rose)',
        parent_plant_link_encyclopedia_id: null,
        growth_structure_habit: 'Shrub, Climber',
        expected_mature_height_meters: { min: 0.3, max: 7, text_range: '0.3m - 7m depending on type' },
        expected_mature_spread_width_meters: { min: 0.3, max: 3, text_range: '0.3m - 3m' },
        life_cycle: 'Perennial - Deciduous',
        native_regions: ['Asia', 'Europe', 'North America', 'Northwest Africa'],
        hardiness_zones: { usda: 'Typically 4-9', rhs: 'H4-H7', other_system_specify: null },
    },
    key_features_uses_general: {
        primary_uses: ['Ornamental', 'Cut Flowers', 'Perfume', 'Hips for food/tea'],
        special_distinguishing_features: ['Iconic flower shape', 'Fragrance (many varieties)', 'Thorny stems'],
        toxicity_information: {
        human_toxicity: { level: 'None', details: 'Petals and hips are edible. Thorns can cause injury.' },
        dog_toxicity: { level: 'None', details: 'Non-toxic, but thorns can be an issue.' },
        cat_toxicity: { level: 'None', details: 'Non-toxic, but thorns can be an issue.' },
        other_animal_toxicity_specify: null
        }
    },
    // ... (fill in all other Rose data from your constants.tsx)
    // Make sure to include all nested structures expected by the Plant type
    // This is a truncated example. You'd copy the full Rose object here.
    cultivation_growing_conditions: {} as any, // Populate fully
    plant_nutrition_fertilization_needs: {} as any, // Populate fully
    plant_care_maintenance: { propagation_methods_summary: {} } as any, // Populate fully
    growth_stage_timelines_days_from_sowing: {} as any, // Populate fully
    ecological_interactions: {} as any, // Populate fully
    fruiting_harvesting_conditional: { is_applicable: true } as any, // Populate fully
    annual_care_calendar_timeline_summary: [], // Populate fully
    use_cases_human_symbiosis: {} as any, // Populate fully
    seed_saving_storage_details: {} as any, // Populate fully
    user_sourcing_information: { user_notes: 'Seeded data', date_record_created: new Date().toISOString(), date_record_last_modified: new Date().toISOString(), information_sources: [], ai_query_log_if_applicable: null }
  },
  {
    id: 'seed-lavender-1',
    display_image_url: 'https://images.unsplash.com/photo-1550900100-983a1998d52c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    image_object_position_y: 50,
    latin_name_scientific_name: 'Lavandula spp.', // ON CONFLICT target
    common_names: ['Lavender'],
    plant_family: 'Lamiaceae',
    plant_type_category: 'Perennial herb/Subshrub',
    description_brief: 'Known for its aromatic flowers and foliage. Drought-tolerant once established.',
    cultivar_variety: 'English (L. angustifolia), French (L. dentata), etc.',
    growth_structure_habit: 'Subshrub, Perennial Herb',
    life_cycle: 'Perennial - Evergreen (typically)',
    plant_identification_overview: {
        common_names: ['Lavender'],
        latin_name_scientific_name: 'Lavandula spp.',
        plant_family: 'Lamiaceae',
        plant_type_category: 'Perennial herb/Subshrub',
        description_brief: 'Known for its aromatic flowers and foliage. Drought-tolerant once established.',
        cultivar_variety: 'English (L. angustifolia), French (L. dentata), etc.',
        parent_plant_link_encyclopedia_id: null,
        growth_structure_habit: 'Subshrub, Perennial Herb',
        expected_mature_height_meters: { min: 0.3, max: 1, text_range: '0.3m - 1m' },
        expected_mature_spread_width_meters: { min: 0.3, max: 1, text_range: '0.3m - 1m' },
        life_cycle: 'Perennial - Evergreen (typically)',
        native_regions: ['Mediterranean region', 'Middle East', 'India'],
        hardiness_zones: { usda: '5-9 (varies)', rhs: 'H4-H5', other_system_specify: null },
    },
    // ... (fill in all other Lavender data from your constants.tsx)
    key_features_uses_general: {} as any, // Populate fully
    cultivation_growing_conditions: {} as any, // Populate fully
    plant_nutrition_fertilization_needs: {} as any, // Populate fully
    plant_care_maintenance: { propagation_methods_summary: {} } as any, // Populate fully
    growth_stage_timelines_days_from_sowing: {} as any, // Populate fully
    ecological_interactions: {} as any, // Populate fully
    fruiting_harvesting_conditional: {is_applicable: false} as any, // Populate fully
    annual_care_calendar_timeline_summary: [], // Populate fully
    use_cases_human_symbiosis: {} as any, // Populate fully
    seed_saving_storage_details: {} as any, // Populate fully
    user_sourcing_information: { user_notes: 'Seeded data', date_record_created: new Date().toISOString(), date_record_last_modified: new Date().toISOString(), information_sources: [], ai_query_log_if_applicable: null }
  }
];

export const INITIAL_FERTILIZERS_DATA_FOR_SEEDING: Partial<Fertilizer>[] = [
  {
    id: 'seed-fert1',
    fertilizer_name: 'Fish Emulsion', // ON CONFLICT target
    type: 'Organic',
    form: 'Liquid',
    data: {
        imageUrl: 'https://picsum.photos/seed/fishemulsion/600/400',
        image_object_position_y: 50,
        description: 'A nutrient-rich fertilizer made from processed fish parts. Known for its quick action and strong odor.',
        primaryUses: 'Nitrogen boost for leafy greens, seedlings, and general vegetative growth.',
        ingredients: 'Hydrolyzed fish proteins, oils, and bones.',
        npkRatio: 'Varies, typically around 5-1-1 or 5-2-2',
        // ... Fill all fields for Fish Emulsion from FertilizerData type
        secondaryMicronutrients: 'Calcium, magnesium, sulfur, trace elements.',
        phImpact: 'Slightly acidic',
        electricalConductivity: '', // Add if available
        applicationMethods: 'Dilute with water and apply as a soil drench or foliar spray.',
        applicationFrequency: 'Every 2-4 weeks during active growth.',
        dilutionRate: 'Typically 1-2 tablespoons per gallon of water. Follow product label.',
        releaseProfile: 'Fast',
        targetPlants: 'Vegetables, flowers, herbs, shrubs, trees. Especially good for heavy feeders.',
        bestPlantStages: 'Seedling, vegetative growth.',
        storageRequirements: 'Store in a cool, dark place, tightly sealed.',
        shelfLife: '1-2 years if stored properly.',
        safetyPrecautions: 'Strong odor may attract animals. Wash hands after use. Avoid spraying on hot, sunny days.',
        compatibilityNotes: '',
        userNotes: 'Smelly but effective! Good for giving young plants a quick start.',
        informationSources: 'Common knowledge, product labels.'
    }
  },
  // ... Add Bone Meal and other fertilizers
];

export const INITIAL_COMPOSTING_METHODS_DATA_FOR_SEEDING: Partial<CompostingMethod>[] = [
  {
    id: 'seed-comp1',
    method_name: 'Cold Pile Composting (Passive)', // ON CONFLICT target
    primary_composting_approach: 'Aerobic (Cold Pile)',
    scale_of_operation: 'Medium (Home Garden)',
    data: {
        imageUrl: 'https://picsum.photos/seed/coldcompost/600/400',
        image_object_position_y: 50,
        description: 'A simple, low-effort method where organic materials are added to a pile or bin as they become available, decomposing slowly over time with minimal management.',
        complexity: 'Beginner',
        timeToMature: '6-24 months, depending on materials and climate.',
         // ... Fill all fields for Cold Pile from CompostingMethodData type
        systemDesignSetup: 'Can be an open pile, or contained in a simple bin (wood pallets, wire mesh, plastic). Choose a level, well-drained spot.',
        inputMaterialsGreen: 'Fruit/vegetable scraps, coffee grounds, tea bags, grass clippings (thin layers), plant trimmings.',
        inputMaterialsBrown: 'Dried leaves, straw, shredded newspaper/cardboard, small twigs, wood chips (sparingly).',
        optimalCNRatio: 'Less critical than hot composting, but aim for a balance.',
        materialsToStrictlyAvoid: 'Meat, dairy, oily foods, pet waste (dog/cat), diseased plants, pernicious weeds with seeds, treated wood, coal/charcoal ash.',
        processManagement: 'Add materials as they become available. Occasional turning can speed it up but is not strictly necessary. Keep moderately moist (like a wrung-out sponge).',
        leachateManagement: 'Generally not a major issue if pile is not overly wet. Ensure good drainage.',
        troubleshootingCommonIssues: 'Slow decomposition (add more greens, chop materials smaller, ensure moisture), bad odors (too wet, too many greens; add browns, turn), pests (bury food scraps, avoid meat/dairy).',
        finishedCompostCharacteristics: 'Dark, crumbly, earthy smell. Original materials may still be somewhat recognizable.',
        harvestingAndUsingCompost: 'Harvest from the bottom of the pile where it’s most decomposed. Sift if desired. Use as soil amendment, mulch, or potting mix component.',
        methodSpecifics: '',
        environmentalBenefits: 'Reduces landfill waste, improves soil health, reduces need for synthetic fertilizers.',
        userNotes: 'Easiest way to start composting. Just pile it up!',
        informationSources: 'General composting guides.'
    }
  },
  // ... Add Vermicomposting and other methods
];

// NOTE: You need to fully populate the 'data' objects above with the complete
// structure from your original INITIAL_PLANTS, INITIAL_FERTILIZERS, etc.
// The examples above are truncated for brevity.
