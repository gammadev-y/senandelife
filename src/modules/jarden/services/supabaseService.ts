

import { supabase } from '../../../../services/supabase';
import {
  Plant, PlantInput, Fertilizer, FertilizerInput, CompostingMethod, CompostingMethodInput,
  PestGuardian, GrowHowTechnique, FloraPediaTableRow, PlantIdentificationOverview,
  GrowingGround, GrowingGroundInput, GrowingGroundData, KeyFeaturesUsesGeneral, CultivationGrowingConditions, PlantNutritionFertilizationNeeds, PlantCareMaintenance, GrowthStageTimelinesDaysFromSowing, EcologicalInteractions, FruitingHarvestingConditional, UseCasesHumanSymbiosis, SeedSavingStorageDetails, LightRequirementsGeneral, WaterRequirementsGeneral, SoilRequirementsGeneral, EnvironmentalTolerancesDetailed, AirTemperatureCelsius, RelativeHumidityPercentage, LightIntensityLux, PlacementSpacing, ToxicityDetail, TextRange, HardinessZones, PruningShaping, RepottingForContainerPlants, PropagationMethodsSummary, SeedPropagationDetails, CuttingPropagationDetails, GraftingPropagationDetails, GrowthStageTimelineEntry, PestInteractions, DiseaseSusceptibility, PestDiseaseManagementSpecificStrategies, CompanionPlanting, PollinatorsWildlifeInteraction, FloweringPollinationForFruitSet, FruitVegetableDevelopmentEnhancement, HarvestingDetails, CulinaryUseItem, PreservationConservationTechnique, AlternativeProductUseItem, MedicinalUseItem, SeedSavingHarvestingGuide, OptimalSeedStorageConditions, FertilizerData, CompostingMethodData, RecentViewItem, ItemTypeForRecentView, ActiveModuleType, SeasonalTip, SeasonalTipInput, UserSourcingInformation, UserProfile, TipImage, GroundLogEntry, Json, UserPreferences, PlantJsonData, GrowingGroundPlant,
  EventType, CalendarEvent, CalendarEventViewModel
} from '../types';
import { PlantListItemData, SeasonalTipListItemData } from './idbServiceTypes'; 
import { produce } from 'immer' ;
import { INITIAL_PLANTS_DATA_FOR_SEEDING, INITIAL_FERTILIZERS_DATA_FOR_SEEDING, INITIAL_COMPOSTING_METHODS_DATA_FOR_SEEDING } from './supabaseSeedData';
import { EVENT_TYPES_SEED_DATA } from '../constants';
import { decode } from 'base64-arraybuffer';
import { deepMerge, isObject } from '../utils/objectUtils';
import { Database } from '../../../../services/supabase';


// --- Image Upload Helper ---
/**
 * Uploads a base64 encoded image to a Supabase storage bucket.
 * The bucket name is specified per call, aligning with the multi-bucket strategy.
 */
export const uploadBase64Image = async (bucket: string, path: string, base64: string): Promise<string> => {
  if (!supabase) throw new Error("Supabase client is not available for image upload.");
  if (!base64) throw new Error("Invalid image data: input is null or empty.");
  if (base64.startsWith('http://') || base64.startsWith('https://')) return base64;

  const mimeTypeMatch = base64.match(/^data:(image\/[^;]+);base64,/);
  if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Invalid image data: could not extract MIME type from base64 string.");
  
  const mimeType = mimeTypeMatch[1];
  const imageData = base64.substring(base64.indexOf(',') + 1);

  try {
    const decodedData = decode(imageData);
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, decodedData, { contentType: mimeType, upsert: true });
    if (uploadError) throw new Error(`Supabase storage error: ${uploadError.message}`);
    
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    if (!publicUrlData || !publicUrlData.publicUrl) throw new Error("Failed to get public URL for uploaded image.");
    return publicUrlData.publicUrl;
  } catch (e) {
    throw e;
  }
};


// --- Default Structure Helpers for Robust Mapping ---
const defaultTextVal = "Not specified";
const defaultNum = 0; 
const defaultTextRange: TextRange = { min: null, max: null, text_range: defaultTextVal };
const defaultHardiness: HardinessZones = { usda: null, rhs: null, other_system_specify: null };
const defaultToxicityDetail: ToxicityDetail = { level: 'Unknown', details: null };

const getDefaultPlantIdentificationOverview = (row?: Partial<FloraPediaTableRow>, jsonDataPio?: Partial<PlantIdentificationOverview>): PlantIdentificationOverview => ({
    common_names: row?.common_names || jsonDataPio?.common_names || [],
    latin_name_scientific_name: row?.latin_name_scientific_name || jsonDataPio?.latin_name_scientific_name || defaultTextVal,
    plant_family: row?.plant_family || jsonDataPio?.plant_family || defaultTextVal,
    plant_type_category: row?.plant_type_category || jsonDataPio?.plant_type_category || defaultTextVal,
    description_brief: row?.description_brief || jsonDataPio?.description_brief || "Awaiting detailed description.",
    cultivar_variety: row?.cultivar_variety || jsonDataPio?.cultivar_variety || null,
    growth_structure_habit: row?.growth_structure_habit || jsonDataPio?.growth_structure_habit || defaultTextVal,
    expected_mature_height_meters: jsonDataPio?.expected_mature_height_meters || defaultTextRange,
    expected_mature_spread_width_meters: jsonDataPio?.expected_mature_spread_width_meters || defaultTextRange,
    life_cycle: row?.life_cycle || jsonDataPio?.life_cycle || defaultTextVal,
    native_regions: jsonDataPio?.native_regions || [],
    hardiness_zones: jsonDataPio?.hardiness_zones || defaultHardiness
});

const getDefaultKeyFeaturesUsesGeneral = (data?: Partial<KeyFeaturesUsesGeneral>): KeyFeaturesUsesGeneral => ({
    primary_uses: data?.primary_uses || [],
    special_distinguishing_features: data?.special_distinguishing_features || [],
    toxicity_information: data?.toxicity_information || {
        human_toxicity: defaultToxicityDetail,
        dog_toxicity: defaultToxicityDetail,
        cat_toxicity: defaultToxicityDetail,
        other_animal_toxicity_specify: null
    }
});

const getDefaultCultivationGrowingConditions = (data?: Partial<CultivationGrowingConditions>): CultivationGrowingConditions => {
    const defaultLight: LightRequirementsGeneral = { recommended_exposure: defaultTextVal, minimum_daily_light_hours_mature: null, notes_on_light_mature: null };
    const defaultWater: WaterRequirementsGeneral = { recommended_watering_frequency_moisture_level: defaultTextVal, drought_tolerance: 'Medium', watering_notes_min_max_guidance: null };
    const defaultSoil: SoilRequirementsGeneral = { preferred_soil_types: [], soil_ph_range_overall: { min: 6.0, max: 7.0, optimal: 6.5 }, soil_drainage_requirements: defaultTextVal, soil_enrichment_notes: null };
    const defaultAirTemp: AirTemperatureCelsius = { daytime_optimal_min: defaultNum, daytime_optimal_max: defaultNum, nighttime_optimal_min: defaultNum, nighttime_optimal_max: defaultNum, absolute_survival_min: defaultNum, absolute_survival_max: defaultNum, notes: defaultTextVal };
    const defaultHumidity: RelativeHumidityPercentage = { optimal_min: defaultNum, optimal_max: defaultNum, absolute_min: defaultNum, absolute_max: defaultNum, notes: defaultTextVal };
    const defaultLightIntensity: LightIntensityLux = { seedling_optimal_min: null, seedling_optimal_max: null, mature_plant_optimal_min: null, mature_plant_optimal_max: null, notes: defaultTextVal };
    const defaultPlacement: PlacementSpacing = { best_placement_indoors: null, best_placement_outdoors: null, recommended_planting_spacing_meters: null };
    const defaultEnvironmentalTolerances: EnvironmentalTolerancesDetailed = { air_temperature_celsius: defaultAirTemp, relative_humidity_percentage: defaultHumidity, light_intensity_lux: defaultLightIntensity, placement_spacing: defaultPlacement };
    return {
        light_requirements_general: data?.light_requirements_general || defaultLight,
        water_requirements_general: data?.water_requirements_general || defaultWater,
        soil_requirements_general: data?.soil_requirements_general || defaultSoil,
        environmental_tolerances_detailed: data?.environmental_tolerances_detailed || defaultEnvironmentalTolerances
    }
};

const getDefaultPlantNutritionFertilizationNeeds = (data?: Partial<PlantNutritionFertilizationNeeds>): PlantNutritionFertilizationNeeds => ({
    general_fertilizer_preferences: data?.general_fertilizer_preferences || null,
    phase_specific_fertilization_needs: data?.phase_specific_fertilization_needs || []
});

const getDefaultPlantCareMaintenance = (data?: Partial<PlantCareMaintenance>): PlantCareMaintenance => {
    const defaultPruning: PruningShaping = { pruning_objectives: [], best_times_for_pruning_seasonal: [], pruning_techniques_description: null, tools_recommended: [], pruning_notes_detailed: null };
    const defaultRepotting: RepottingForContainerPlants | null = null;
    const defaultSeedPropagation: SeedPropagationDetails = { is_applicable: false, brief_sowing_and_early_care_steps: [], expected_success_rate_notes: null, recommended_sowing_time_season: null, pre_germination_treatment: { soaking_seeds_details: null, scarification_details: null, stratification_details: null }, germination_requirements_detailed: { seed_depth_cm: { min: 0, max: 0, notes: null }, soil_temperature_celsius: { optimal_min: 0, optimal_max: 0, absolute_min_for_germination: 0, absolute_max_for_germination: 0, notes: null }, soil_mix_recommendation: defaultTextVal, soil_moisture_level_description: defaultTextVal, watering_method_germination: defaultTextVal, humidity_percentage_germination: { optimal_min: 0, optimal_max: 0 }, light_for_germination_requirement: defaultTextVal, expected_germination_timeframe_days_range: null }, early_seedling_phase_water_management_sprout_to_8_weeks: { target_medium_moisture_level_description: null, recommended_watering_method: [], watering_frequency_guidance: null, approximate_amount_of_water_per_application: null, importance_of_good_drainage_notes: null, water_temperature_consideration_celsius: null, soil_temperature_considerations_after_watering: null, humidity_considerations_acclimation: null, signs_of_overwatering_seedlings: [], signs_of_underwatering_seedlings: [], transitioning_watering_practices_notes: null }, other_early_seedling_care_sprout_to_8_weeks: { light_requirements_for_seedlings_hours_type: null, temperature_requirements_for_seedlings_celsius: { day_min: null, day_max: null, night_min: null, night_max: null }, ventilation_needs_description: null, first_fertilization_details: null, hardening_off_procedure_within_8_weeks: null } };
    const defaultCuttingPropagation: CuttingPropagationDetails = { is_applicable: false, cutting_types_common: [], best_time_for_cuttings_by_type: [], brief_step_by_step_overview: [], cutting_preparation_notes: null, rooting_medium_recommendations: [], environmental_conditions_for_rooting_notes: null, expected_rooting_timeframe_weeks_range: null, aftercare_once_rooted_instructions: null, expected_success_rate_notes: null, common_challenges: [] };
    const defaultGraftingPropagation: GraftingPropagationDetails = { is_applicable: false, common_grafting_types_used: [], best_time_for_grafting_by_type: [], brief_step_by_step_overview: [], rootstock_selection_considerations: null, scion_selection_considerations: null, tools_materials_needed: [], aftercare_instructions_detailed: null, expected_success_rate_notes: null, common_challenges: [] };
    const defaultPropagation: PropagationMethodsSummary = {
        primary_methods: [],
        seed_propagation_details: defaultSeedPropagation,
        cutting_propagation_details: defaultCuttingPropagation,
        grafting_propagation_details: defaultGraftingPropagation
    };
    return {
        pruning_shaping: data?.pruning_shaping || defaultPruning,
        repotting_for_container_plants: data?.repotting_for_container_plants || defaultRepotting,
        root_strengthening_techniques: data?.root_strengthening_techniques || [],
        propagation_methods_summary: data?.propagation_methods_summary || defaultPropagation
    }
};

const getDefaultGrowthStageTimelines = (data?: Partial<GrowthStageTimelinesDaysFromSowing>): GrowthStageTimelinesDaysFromSowing => {
    const defaultEntry: GrowthStageTimelineEntry = { expected_min_days: defaultNum, expected_max_days: defaultNum, optimal_average_days: defaultNum, event_description_notes: defaultTextVal };
    return {
        sprouting: data?.sprouting || defaultEntry,
        first_true_leaves: data?.first_true_leaves || defaultEntry,
        first_repotting_seedling: data?.first_repotting_seedling || { ...defaultEntry, pot_size_increase_factor_guideline: null },
        hardening_off_start: data?.hardening_off_start || defaultEntry,
        transplant_outdoors_seedling: data?.transplant_outdoors_seedling || defaultEntry,
        first_fertilization_after_true_leaves: data?.first_fertilization_after_true_leaves || { ...defaultEntry, trigger_condition: defaultTextVal },
        first_pruning_formative: data?.first_pruning_formative || defaultEntry,
        flowering_start: data?.flowering_start || defaultEntry,
        first_harvest_expected: data?.first_harvest_expected || defaultEntry,
    }
};

const getDefaultEcologicalInteractions = (data?: Partial<EcologicalInteractions>): EcologicalInteractions => {
    const defaultPest: PestInteractions = { pests_attracted_to_plant: [], pests_repelled_by_plant: [] };
    const defaultDisease: DiseaseSusceptibility = { common_diseases: [], prevention_non_chemical_treatment_notes: null };
    const defaultMgmt: PestDiseaseManagementSpecificStrategies = { natural_organic_pest_control_methods: [], chemical_pest_control_options_if_necessary: [], integrated_pest_management_ipm_strategies_for_plant: null };
    const defaultCompanion: CompanionPlanting = { beneficial_companions_plants_it_aids: [], synergistic_companions_plants_that_aid_it: [], antagonistic_plants_avoid_nearby: [] };
    const defaultPollinator: PollinatorsWildlifeInteraction = { attracts_pollinators: [], provides_food_shelter_for_wildlife: [] };
    return {
        pest_interactions: data?.pest_interactions || defaultPest,
        disease_susceptibility: data?.disease_susceptibility || defaultDisease,
        pest_disease_management_specific_strategies: data?.pest_disease_management_specific_strategies || defaultMgmt,
        companion_planting: data?.companion_planting || defaultCompanion,
        pollinators_wildlife_interaction: data?.pollinators_wildlife_interaction || defaultPollinator
    }
};

const getDefaultFruitingHarvesting = (data?: Partial<FruitingHarvestingConditional>): FruitingHarvestingConditional => {
    const defaultFlowering: FloweringPollinationForFruitSet = { flowering_time_season: null, pollination_requirements: null, cross_pollination_partners_if_applicable_ids_names: [], techniques_to_assist_pollination: null };
    const defaultDev: FruitVegetableDevelopmentEnhancement = { time_from_flower_to_harvest_typical: null, techniques_to_improve_size: null, techniques_to_improve_flavor: null, techniques_to_improve_texture: null, techniques_to_improve_juice_content: null };
    const defaultHarvest: HarvestingDetails = { harvesting_season_indicators_of_ripeness: null, harvesting_techniques: null, post_harvest_handling_storage_short_term: null };
    return {
        is_applicable: data?.is_applicable || false,
        flowering_pollination_for_fruit_set: data?.flowering_pollination_for_fruit_set || defaultFlowering,
        fruit_vegetable_development_enhancement: data?.fruit_vegetable_development_enhancement || defaultDev,
        harvesting_details: data?.harvesting_details || defaultHarvest
    }
};

const getDefaultUseCases = (data?: Partial<UseCasesHumanSymbiosis>): UseCasesHumanSymbiosis => ({
    culinary_uses: data?.culinary_uses || [],
    preservation_conservation_techniques_for_plant: data?.preservation_conservation_techniques_for_plant || [],
    alternative_products_uses: data?.alternative_products_uses || [],
    medicinal_uses_traditional_folk: data?.medicinal_uses_traditional_folk || [],
    other_craft_material_uses: data?.other_craft_material_uses || []
});

const getDefaultSeedSaving = (data?: Partial<SeedSavingStorageDetails>): SeedSavingStorageDetails => {
    const defaultHarvestGuide: SeedSavingHarvestingGuide = { timing_indicators: null, method_selection_criteria: null };
    const defaultStorage: OptimalSeedStorageConditions = { temperature_celsius: null, humidity_percent: null, container_type: null, other_notes: null };
    return {
        seed_viability_duration_years_optimal: data?.seed_viability_duration_years_optimal || null,
        harvesting_seeds_guide: data?.harvesting_seeds_guide || defaultHarvestGuide,
        cleaning_drying_seeds_techniques: data?.cleaning_drying_seeds_techniques || null,
        optimal_storage_conditions: data?.optimal_storage_conditions || defaultStorage,
        seed_viability_testing_methods_description: data?.seed_viability_testing_methods_description || []
    }
};

const getDefaultUserSourcing = (data?: Partial<UserSourcingInformation>): UserSourcingInformation => ({
    user_notes: data?.user_notes || null,
    date_record_created: data?.date_record_created || new Date().toISOString(),
    date_record_last_modified: data?.date_record_last_modified || new Date().toISOString(),
    information_sources: data?.information_sources || [],
    ai_query_log_if_applicable: data?.ai_query_log_if_applicable || null,
});


// --- Mappers ---
const mapFloraPediaRowToPlant = (row: FloraPediaTableRow): Plant => {
    const jsonData = (row.data as PlantJsonData | null) ?? ({} as Partial<PlantJsonData>);
    const pioFromJson = jsonData.plant_identification_overview;
    return {
        id: row.id,
        parent_plant_id: row.parent_plant_id,
        display_image_url: jsonData.display_image_url || null,
        image_object_position_y: jsonData.image_object_position_y || 50,
        plant_identification_overview: getDefaultPlantIdentificationOverview(row, pioFromJson),
        key_features_uses_general: getDefaultKeyFeaturesUsesGeneral(jsonData.key_features_uses_general),
        cultivation_growing_conditions: getDefaultCultivationGrowingConditions(jsonData.cultivation_growing_conditions),
        plant_nutrition_fertilization_needs: getDefaultPlantNutritionFertilizationNeeds(jsonData.plant_nutrition_fertilization_needs),
        plant_care_maintenance: getDefaultPlantCareMaintenance(jsonData.plant_care_maintenance),
        growth_stage_timelines_days_from_sowing: getDefaultGrowthStageTimelines(jsonData.growth_stage_timelines_days_from_sowing),
        ecological_interactions: getDefaultEcologicalInteractions(jsonData.ecological_interactions),
        fruiting_harvesting_conditional: getDefaultFruitingHarvesting(jsonData.fruiting_harvesting_conditional),
        annual_care_calendar_timeline_summary: jsonData.annual_care_calendar_timeline_summary || [],
        use_cases_human_symbiosis: getDefaultUseCases(jsonData.use_cases_human_symbiosis),
        seed_saving_storage_details: getDefaultSeedSaving(jsonData.seed_saving_storage_details),
        user_sourcing_information: getDefaultUserSourcing(jsonData.user_sourcing_information),
        created_at: row.created_at,
        updated_at: row.updated_at
    };
};

const mapPlantToFloraPediaRow = (plant: Omit<Plant, 'id' | 'created_at' | 'updated_at'>): Omit<FloraPediaTableRow, 'id' | 'created_at' | 'updated_at'> => {
  const { plant_identification_overview, ...data } = plant;
  const { common_names, latin_name_scientific_name, plant_family, plant_type_category, description_brief, cultivar_variety, growth_structure_habit, life_cycle } = plant_identification_overview;
  
  // The 'data' field in the DB will store everything except the direct columns
  const jsonData: PlantJsonData = {
    ...data,
    // We also store a copy of the identification data within the JSON for completeness and easier querying on non-indexed fields
    plant_identification_overview: plant_identification_overview
  };

  return {
    common_names: common_names,
    latin_name_scientific_name: latin_name_scientific_name,
    plant_family: plant_family,
    plant_type_category: plant_type_category,
    description_brief: description_brief,
    cultivar_variety: cultivar_variety,
    growth_structure_habit: growth_structure_habit,
    life_cycle: life_cycle,
    parent_plant_id: plant.parent_plant_id || null,
    data: jsonData,
  };
};

export const mapPlantToPlantListItemData = (plant: Plant): PlantListItemData => ({
    id: plant.id,
    commonName: plant.plant_identification_overview.common_names[0] || plant.plant_identification_overview.latin_name_scientific_name,
    scientificName: plant.plant_identification_overview.latin_name_scientific_name,
    imageUrl: plant.display_image_url,
    imagePosY: plant.image_object_position_y,
    family: plant.plant_identification_overview.plant_family,
    typeCategory: plant.plant_identification_overview.plant_type_category,
    updatedAt: plant.updated_at,
});

const mapNutriBaseRowToFertilizer = (row: Database['public']['Tables']['nutri_base']['Row']): Fertilizer => {
    const defaultData: FertilizerData = { description: '', primaryUses: '', ingredients: '', applicationMethods: '', releaseProfile: '', storageRequirements: '', safetyPrecautions: '' };
    return {
        id: row.id,
        fertilizer_name: row.fertilizer_name,
        fertilizer_id_sku: row.fertilizer_id_sku || undefined,
        type: row.type,
        form: row.form,
        data: (row.data as FertilizerData) || defaultData,
        created_at: row.created_at,
        updated_at: row.updated_at
    };
};

const mapCompostCornerRowToCompostingMethod = (row: Database['public']['Tables']['compost_corner']['Row']): CompostingMethod => {
    const defaultData: CompostingMethodData = { description: '', complexity: 'Beginner', timeToMature: '', systemDesignSetup: '', inputMaterialsGreen: '', inputMaterialsBrown: '', materialsToStrictlyAvoid: '', processManagement: '', troubleshootingCommonIssues: '', finishedCompostCharacteristics: '', harvestingAndUsingCompost: '', environmentalBenefits: '' };
    return {
        id: row.id,
        method_name: row.method_name,
        composting_method_id: row.composting_method_id || undefined,
        primary_composting_approach: row.primary_composting_approach,
        scale_of_operation: row.scale_of_operation,
        produced_fertilizer_id: row.produced_fertilizer_id || undefined,
        data: (row.data as CompostingMethodData) || defaultData,
        created_at: row.created_at,
        updated_at: row.updated_at
    };
};

const mapGrowingGroundRowToGrowingGround = (row: Database['public']['Tables']['growing_grounds']['Row']): GrowingGround => {
    const data = (row.data as Partial<GrowingGroundData> | null) ?? {};
    return {
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        description: data.description || '',
        type: data.type || 'Other',
        imageUrl: data.imageUrl || null,
        image_object_position_y: data.image_object_position_y || 50,
        lightHoursMorning: data.lightHoursMorning || 0,
        lightHoursAfternoon: data.lightHoursAfternoon || 0,
        soilType: data.soilType || 'Other',
        customSoilDescription: data.customSoilDescription,
        areaDimensions: data.areaDimensions,
        plants: data.plants || [],
        logs: data.logs || [],
        customNotes: data.customNotes,
        informationSources: data.informationSources
    };
};

const mapSeasonalTipRowToSeasonalTip = (row: Database['public']['Tables']['seasonal_tips']['Row']): SeasonalTip => ({
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    content_type: row.content_type,
    source_url: row.source_url,
    article_markdown_content: row.article_markdown_content,
    images: (row.images as TipImage[]) || [],
    tags: row.tags || undefined,
    author_name: row.author_name || undefined,
    published_at: row.published_at || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at
});

export const mapSeasonalTipToListItemData = (tip: SeasonalTip): SeasonalTipListItemData => ({
    id: tip.id,
    title: tip.title,
    description: tip.description,
    imageUrl: tip.images?.[0]?.url || null,
    imagePosY: tip.images?.[0]?.object_position_y || 50,
    tags: tip.tags,
    publishedAt: tip.published_at || tip.created_at,
    updatedAt: tip.updated_at,
});


// --- GET ---
export const getPlants = async (): Promise<Plant[]> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const { data, error } = await supabase.from('flora_pedia').select('*').order('updated_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch plants: ${error.message}`);
    return data.map(mapFloraPediaRowToPlant);
};

export const getFertilizers = async (): Promise<Fertilizer[]> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const { data, error } = await supabase.from('nutri_base').select('*').order('fertilizer_name');
    if (error) throw new Error(`Failed to fetch fertilizers: ${error.message}`);
    return data.map(mapNutriBaseRowToFertilizer);
};

export const getCompostingMethods = async (): Promise<CompostingMethod[]> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const { data, error } = await supabase.from('compost_corner').select('*').order('method_name');
    if (error) throw new Error(`Failed to fetch composting methods: ${error.message}`);
    return data.map(mapCompostCornerRowToCompostingMethod);
};

export const getGrowingGrounds = async (userId?: string): Promise<GrowingGround[]> => {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase.from('growing_grounds').select('*').eq('user_id', userId).order('name');
    if (error) throw new Error(`Failed to fetch growing grounds: ${error.message}`);
    return data.map(mapGrowingGroundRowToGrowingGround);
};

export const getSeasonalTips = async (): Promise<SeasonalTip[]> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const { data, error } = await supabase.from('seasonal_tips').select('*').order('published_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch seasonal tips: ${error.message}`);
    return data.map(mapSeasonalTipRowToSeasonalTip);
};

export const getRecentViews = async (userId?: string): Promise<RecentViewItem[]> => {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase.from('user_view_history').select('*').eq('user_id', userId).order('viewed_at', { ascending: false }).limit(20);
    if (error) { console.error('Error fetching recent views:', error); return []; }
    return data as RecentViewItem[];
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
        throw new Error(`Failed to get user profile: ${error.message}`);
    }
    return data as UserProfile | null;
};


// --- ADD ---
export const addPlant = async (plantData: Omit<Plant, 'id' | 'created_at' | 'updated_at'>): Promise<Plant> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const mappedData = { ...plantData };
    if (mappedData.display_image_url && mappedData.display_image_url.startsWith('data:image')) {
        const path = `plants/${new Date().getTime()}-${mappedData.plant_identification_overview.latin_name_scientific_name.replace(/\s+/g, '-')}.png`;
        const publicUrl = await uploadBase64Image('flora-pedia-images', path, mappedData.display_image_url);
        mappedData.display_image_url = publicUrl;
    }
    const rowToInsert = mapPlantToFloraPediaRow(mappedData);
    const { data, error } = await supabase.from('flora_pedia').insert(rowToInsert as any).select().single();
    if (error) throw error;
    return mapFloraPediaRowToPlant(data);
};

export const addFertilizer = async (fertilizerInput: FertilizerInput): Promise<Fertilizer> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const newFertilizerData: FertilizerData = {
        description: fertilizerInput.description || 'No description provided.',
        primaryUses: '', ingredients: '', applicationMethods: '', storageRequirements: '',
        releaseProfile: '', safetyPrecautions: '',
        imageUrl: null, image_object_position_y: 50,
    };
    if (fertilizerInput.imageUrl && fertilizerInput.imageUrl.startsWith('data:image')) {
        const path = `fertilizers/${new Date().getTime()}-${fertilizerInput.name.replace(/\s+/g, '-')}.png`;
        const publicUrl = await uploadBase64Image('fertilizer-images', path, fertilizerInput.imageUrl);
        newFertilizerData.imageUrl = publicUrl;
        newFertilizerData.image_object_position_y = fertilizerInput.image_object_position_y || 50;
    }
    const rowToInsert: Database['public']['Tables']['nutri_base']['Insert'] = {
        fertilizer_name: fertilizerInput.name,
        type: fertilizerInput.type || 'Other',
        form: fertilizerInput.form || 'Other',
        data: newFertilizerData,
    };
    const { data, error } = await supabase.from('nutri_base').insert(rowToInsert as any).select().single();
    if (error) throw error;
    return mapNutriBaseRowToFertilizer(data);
};

export const addCompostingMethod = async (methodInput: CompostingMethodInput): Promise<CompostingMethod> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const newMethodData: CompostingMethodData = {
        description: methodInput.description || 'No description provided.',
        complexity: 'Beginner', timeToMature: '', systemDesignSetup: '', inputMaterialsGreen: '',
        inputMaterialsBrown: '', materialsToStrictlyAvoid: '', processManagement: '',
        finishedCompostCharacteristics: '', harvestingAndUsingCompost: '', environmentalBenefits: '',
        troubleshootingCommonIssues: '',
        imageUrl: null, image_object_position_y: 50,
    };
    if (methodInput.imageUrl && methodInput.imageUrl.startsWith('data:image')) {
        const path = `compost-methods/${new Date().getTime()}-${methodInput.name.replace(/\s+/g, '-')}.png`;
        const publicUrl = await uploadBase64Image('compost-method-images', path, methodInput.imageUrl);
        newMethodData.imageUrl = publicUrl;
        newMethodData.image_object_position_y = methodInput.image_object_position_y || 50;
    }
    const rowToInsert: Database['public']['Tables']['compost_corner']['Insert'] = {
        method_name: methodInput.name,
        primary_composting_approach: methodInput.approach || 'Other',
        scale_of_operation: 'Medium (Home Garden)',
        data: newMethodData,
    };
    const { data, error } = await supabase.from('compost_corner').insert(rowToInsert as any).select().single();
    if (error) throw error;
    return mapCompostCornerRowToCompostingMethod(data);
};

export const addGrowingGround = async (groundInput: GrowingGroundInput, userId: string): Promise<GrowingGround> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const newGroundData: GrowingGroundData = {
        description: groundInput.description || 'No description provided.',
        type: groundInput.type || 'Other',
        lightHoursMorning: 0, lightHoursAfternoon: 0, soilType: 'Loamy',
        plants: [], logs: [],
        imageUrl: null, image_object_position_y: 50,
    };
    if (groundInput.imageUrl && groundInput.imageUrl.startsWith('data:image')) {
        const path = `grounds/${userId}/${new Date().getTime()}-${groundInput.name.replace(/\s+/g, '-')}.png`;
        const publicUrl = await uploadBase64Image('growing-grounds-gallery-images', path, groundInput.imageUrl);
        newGroundData.imageUrl = publicUrl;
        newGroundData.image_object_position_y = groundInput.image_object_position_y || 50;
    }
    const rowToInsert: Database['public']['Tables']['growing_grounds']['Insert'] = {
        name: groundInput.name,
        user_id: userId,
        data: newGroundData,
    };
    const { data, error } = await supabase.from('growing_grounds').insert(rowToInsert as any).select().single();
    if (error) throw error;
    return mapGrowingGroundRowToGrowingGround(data);
};

export const addSeasonalTip = async (tipInput: SeasonalTipInput): Promise<SeasonalTip> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const processedImages: TipImage[] = [];
    for (const img of tipInput.images) {
        if (img.url.startsWith('data:image')) {
            const path = `seasonal-tips/${new Date().getTime()}-${tipInput.title.substring(0, 20).replace(/\s+/g, '-')}.png`;
            const publicUrl = await uploadBase64Image('seasonal-tips-images', path, img.url);
            processedImages.push({ url: publicUrl, object_position_y: img.object_position_y || 50 });
        } else {
            processedImages.push(img);
        }
    }
    const rowToInsert: Database['public']['Tables']['seasonal_tips']['Insert'] = {
        ...tipInput,
        images: processedImages,
        published_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('seasonal_tips').insert(rowToInsert as any).select().single();
    if (error) throw error;
    return mapSeasonalTipRowToSeasonalTip(data);
};

export const addRecentView = async (itemId: string, itemType: ItemTypeForRecentView, itemName: string, itemImageUrl: string | null, itemModuleId: ActiveModuleType) => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Only for logged in users
    const { error } = await supabase.from('user_view_history').upsert({
        id: `${user.id}-${itemId}`, // Composite key to prevent duplicates
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        item_name: itemName,
        item_image_url: itemImageUrl,
        item_module_id: itemModuleId,
        viewed_at: new Date().toISOString()
    } as any, { onConflict: 'id' });
    if (error) console.error("Error adding recent view:", error);
};


// --- UPDATE ---

/**
 * A robust helper function to separate direct column updates from JSONB data updates.
 * @param updates The partial update object.
 * @param directColumns An array of keys that are direct columns in the database table.
 * @returns An object containing `directUpdates` for columns and `dataUpdates` for the JSONB field.
 */
const separateUpdates = <T, U>(updates: Partial<T>, directColumns: (keyof U)[]) => {
    const directUpdates: Partial<U> = {};
    const dataUpdates: Partial<any> = {};

    for (const key in updates) {
        if (directColumns.includes(key as any)) {
            (directUpdates as any)[key] = (updates as any)[key];
        } else if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            (dataUpdates as any)[key] = (updates as any)[key];
        }
    }
    return { directUpdates, dataUpdates };
};

export const updatePlant = async (plantId: string, updates: Partial<Plant>): Promise<Plant> => {
    if (!supabase) throw new Error("Supabase client is not available.");

    if (updates.display_image_url && updates.display_image_url.startsWith('data:image')) {
        const path = `plants/${new Date().getTime()}-${updates.plant_identification_overview?.latin_name_scientific_name || plantId}.png`;
        updates.display_image_url = await uploadBase64Image('flora-pedia-images', path, updates.display_image_url);
    }

    const { directUpdates, dataUpdates } = separateUpdates<Plant, Database['public']['Tables']['flora_pedia']['Update']>(
        updates, ['common_names', 'latin_name_scientific_name', 'plant_family', 'plant_type_category', 'description_brief', 'cultivar_variety', 'parent_plant_id', 'growth_structure_habit', 'life_cycle']
    );

    if (Object.keys(dataUpdates).length > 0) {
        const { data: existing, error: fetchError } = await supabase.from('flora_pedia').select('data').eq('id', plantId).single();
        if (fetchError) throw new Error(`Failed to fetch existing plant data: ${fetchError.message}`);
        (directUpdates as any).data = deepMerge(existing?.data || {}, dataUpdates);
    }

    const { data: updatedRow, error } = await supabase.from('flora_pedia').update(directUpdates as any).eq('id', plantId).select().single();
    if (error) throw new Error(`Failed to update plant: ${error.message}`);
    return mapFloraPediaRowToPlant(updatedRow);
};

export const updateFertilizer = async (id: string, updates: Partial<Fertilizer>): Promise<Fertilizer> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    
    // Check if the `data` property within updates has an image to upload
    if (updates.data?.imageUrl && updates.data.imageUrl.startsWith('data:image')) {
        const name = updates.fertilizer_name || id;
        const path = `fertilizers/${new Date().getTime()}-${name.replace(/\s+/g, '-')}.png`;
        updates.data.imageUrl = await uploadBase64Image('fertilizer-images', path, updates.data.imageUrl);
    }

    const { directUpdates, dataUpdates } = separateUpdates<Fertilizer, Database['public']['Tables']['nutri_base']['Update']>(
        updates, ['fertilizer_name', 'fertilizer_id_sku', 'type', 'form']
    );

    if (Object.keys(dataUpdates).length > 0) {
        const { data: existing } = await supabase.from('nutri_base').select('data').eq('id', id).single();
        (directUpdates as any).data = deepMerge(existing?.data || {}, dataUpdates);
    }
    
    const { data: updatedRow, error } = await supabase.from('nutri_base').update(directUpdates as any).eq('id', id).select().single();
    if (error) throw error;
    return mapNutriBaseRowToFertilizer(updatedRow);
};

export const updateCompostingMethod = async (id: string, updates: Partial<CompostingMethod>): Promise<CompostingMethod> => {
    if (!supabase) throw new Error("Supabase client is not available.");

    if (updates.data?.imageUrl && updates.data.imageUrl.startsWith('data:image')) {
        const name = updates.method_name || id;
        const path = `compost-methods/${new Date().getTime()}-${name.replace(/\s+/g, '-')}.png`;
        updates.data.imageUrl = await uploadBase64Image('compost-method-images', path, updates.data.imageUrl);
    }

    const { directUpdates, dataUpdates } = separateUpdates<CompostingMethod, Database['public']['Tables']['compost_corner']['Update']>(
        updates, ['method_name', 'composting_method_id', 'primary_composting_approach', 'scale_of_operation', 'produced_fertilizer_id']
    );

    if (Object.keys(dataUpdates).length > 0) {
        const { data: existing } = await supabase.from('compost_corner').select('data').eq('id', id).single();
        (directUpdates as any).data = deepMerge(existing?.data || {}, dataUpdates);
    }
    
    const { data: updatedRow, error } = await supabase.from('compost_corner').update(directUpdates as any).eq('id', id).select().single();
    if (error) throw error;
    return mapCompostCornerRowToCompostingMethod(updatedRow);
};

export const updateGrowingGround = async (id: string, updates: Partial<GrowingGround>): Promise<GrowingGround> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated.");

    // Image upload for the main ground image
    if (updates.imageUrl && updates.imageUrl.startsWith('data:image')) {
        const name = updates.name || id;
        const path = `grounds/${userId}/${new Date().getTime()}-${name.replace(/\s+/g, '-')}.png`;
        updates.imageUrl = await uploadBase64Image('growing-grounds-gallery-images', path, updates.imageUrl);
    }
    
    // Image upload for new log entries
    if (updates.logs) {
        for (const log of updates.logs) {
            if (log.photoUrls) {
                for (let i = 0; i < log.photoUrls.length; i++) {
                    const photo = log.photoUrls[i];
                    if (photo && photo.startsWith('data:image')) {
                         const path = `grounds/${userId}/logs/${id}/${new Date().getTime()}-${i}.png`;
                         log.photoUrls[i] = await uploadBase64Image('growing-grounds-log-entry-photos', path, photo);
                    }
                }
            }
        }
    }
    
    const { directUpdates, dataUpdates } = separateUpdates<GrowingGround, Database['public']['Tables']['growing_grounds']['Update']>(
        updates, ['name']
    );
    
    if (Object.keys(dataUpdates).length > 0) {
        const { data: existing } = await supabase.from('growing_grounds').select('data').eq('id', id).single();
        (directUpdates as any).data = deepMerge(existing?.data || {}, dataUpdates);
    }
    
    const { data: updatedRow, error } = await supabase.from('growing_grounds').update(directUpdates as any).eq('id', id).select().single();
    if (error) throw error;
    return mapGrowingGroundRowToGrowingGround(updatedRow);
};

export const updateSeasonalTip = async (id: string, updates: Partial<SeasonalTipInput>): Promise<SeasonalTip> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    
    const updatePayload: Partial<Database['public']['Tables']['seasonal_tips']['Update']> = { ...updates };
    
    if (updates.images) {
        const processedImages: TipImage[] = [];
        for (const img of updates.images) {
            if (img.url && img.url.startsWith('data:image')) {
                const path = `seasonal-tips/${new Date().getTime()}-${updates.title?.substring(0, 20).replace(/\s+/g, '-')}.png`;
                const publicUrl = await uploadBase64Image('seasonal-tips-images', path, img.url);
                processedImages.push({ ...img, url: publicUrl });
            } else {
                processedImages.push(img);
            }
        }
        updatePayload.images = processedImages;
    }
    
    const { data: updatedRow, error } = await supabase.from('seasonal_tips').update(updatePayload as any).eq('id', id).select().single();
    if (error) throw error;
    return mapSeasonalTipRowToSeasonalTip(updatedRow);
};

export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    
    if (updates.avatar_url && updates.avatar_url.startsWith('data:image')) {
        const path = `avatars/${id}.png`;
        updates.avatar_url = await uploadBase64Image('user-avatar', path, updates.avatar_url);
    }
    
    const { data, error } = await supabase.from('user_profiles').update(updates as any).eq('id', id).select().single();
    if (error) throw new Error(`Failed to update user profile: ${error.message}`);
    return data as UserProfile | null;
};


// --- DELETE ---
export const deleteGrowingGround = async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client is not available.");
    const { error } = await supabase.from('growing_grounds').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete growing ground: ${error.message}`);
};

// --- Calendar ---
export const getEventTypes = async (): Promise<EventType[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('event_types').select('*');
    if (error) { console.error("Error fetching event types:", error); return []; }
    return data;
};

export const seedEventTypes = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('event_types').upsert(EVENT_TYPES_SEED_DATA as any, { onConflict: 'name', ignoreDuplicates: true });
    if (error) console.error('Error seeding event types:', error);
};

export const getCalendarEvents = async (userId?: string): Promise<CalendarEventViewModel[]> => {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase
        .from('calendar_events')
        .select(`*, event_types (*)`)
        .eq('user_id', userId);
    
    if (error) {
        console.error("Error fetching calendar events:", error);
        return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data.map(event => {
        const eventDate = new Date(event.start_date);
        const status: CalendarEventViewModel['status'] = event.is_completed 
            ? 'Completed' 
            : (eventDate < today ? 'Overdue' : 'Pending');
        return {
            ...event,
            event_types: event.event_types as EventType,
            status: status
        };
    });
};

export const addCalendarEvent = async (data: { event: Database['public']['Tables']['calendar_events']['Insert'], groundId?: string }): Promise<CalendarEvent> => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { event, groundId } = data;
    const { data: newEvent, error } = await supabase.from('calendar_events').insert(event as any).select().single();
    if (error) throw new Error(`Failed to add calendar event: ${error.message}`);
    if (groundId && newEvent) {
        const { error: linkError } = await supabase.from('growing_ground_events').insert({ growing_ground_id: groundId, calendar_event_id: newEvent.id } as any);
        if (linkError) console.error("Failed to link event to growing ground:", linkError);
    }
    return newEvent as CalendarEvent;
};

export const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    if (!supabase) throw new Error("Supabase client not available.");
    const { data, error } = await supabase.from('calendar_events').update(updates as any).eq('id', id).select().single();
    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return data;
};

export const deleteCalendarEvent = async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not available.");
    await supabase.from('growing_ground_events').delete().eq('calendar_event_id', id); // Clean up links first
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete event: ${error.message}`);
};

// --- SEEDING ---
export const seedInitialData = async () => {
    if (!supabase) return;
    try {
        // Plants
        for (const plantData of INITIAL_PLANTS_DATA_FOR_SEEDING) {
            const row = mapPlantToFloraPediaRow(plantData as any);
            await supabase.from('flora_pedia').upsert(row as any, { onConflict: 'latin_name_scientific_name' });
        }
        // Fertilizers
        await supabase.from('nutri_base').upsert(INITIAL_FERTILIZERS_DATA_FOR_SEEDING as any, { onConflict: 'fertilizer_name' });
        // Composting Methods
        await supabase.from('compost_corner').upsert(INITIAL_COMPOSTING_METHODS_DATA_FOR_SEEDING as any, { onConflict: 'method_name' });
    } catch (error) {
        console.error("Error seeding initial data:", error);
    }
};
