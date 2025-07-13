

import { supabase } from '../../../../services/supabase';
import {
  Plant, PlantInput, Fertilizer, FertilizerInput, CompostingMethod, CompostingMethodInput,
  PestGuardian, GrowHowTechnique, FloraPediaTableRow, PlantIdentificationOverview,
  GrowingGround, GrowingGroundInput, GrowingGroundData, KeyFeaturesUsesGeneral, CultivationGrowingConditions, PlantNutritionFertilizationNeeds, PlantCareMaintenance, GrowthStageTimelinesDaysFromSowing, EcologicalInteractions, FruitingHarvestingConditional, UseCasesHumanSymbiosis, SeedSavingStorageDetails, LightRequirementsGeneral, WaterRequirementsGeneral, SoilRequirementsGeneral, EnvironmentalTolerancesDetailed, AirTemperatureCelsius, RelativeHumidityPercentage, LightIntensityLux, PlacementSpacing, ToxicityDetail, TextRange, HardinessZones, PruningShaping, RepottingForContainerPlants, PropagationMethodsSummary, SeedPropagationDetails, CuttingPropagationDetails, GraftingPropagationDetails, GrowthStageTimelineEntry, PestInteractions, DiseaseSusceptibility, PestDiseaseManagementSpecificStrategies, CompanionPlanting, PollinatorsWildlifeInteraction, FloweringPollinationForFruitSet, FruitVegetableDevelopmentEnhancement, HarvestingDetails, CulinaryUseItem, PreservationConservationTechnique, AlternativeProductUseItem, MedicinalUseItem, SeedSavingHarvestingGuide, OptimalSeedStorageConditions, FertilizerData, CompostingMethodData, RecentViewItem, ItemTypeForRecentView, ActiveModuleType, SeasonalTip, SeasonalTipInput, UserSourcingInformation, UserProfile, TipImage, GroundLogEntry, Json, UserPreferences, PlantJsonData, GrowingGroundPlant,
  EventType, CalendarEvent, CalendarEventViewModel
} from '../types';
import { PlantListItemData, SeasonalTipListItemData } from './idbServiceTypes'; 
import { produce } from 'https://esm.sh/immer@10.0.3' ;
import { INITIAL_PLANTS_DATA_FOR_SEEDING, INITIAL_FERTILIZERS_DATA_FOR_SEEDING, INITIAL_COMPOSTING_METHODS_DATA_FOR_SEEDING } from './supabaseSeedData';
import { EVENT_TYPES_SEED_DATA } from '../constants';
import { decode } from 'base64-arraybuffer';
import { deepMerge, isObject } from '../utils/objectUtils';
import { Database } from '../../../../services/supabase';


// --- Image Upload Helper ---
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
    hardiness_zones: jsonDataPio?.hardiness_zones || defaultHardiness,
});

const getDefaultKeyFeaturesUsesGeneral = (jsonDataKfug?: Partial<KeyFeaturesUsesGeneral>): KeyFeaturesUsesGeneral => ({
    primary_uses: jsonDataKfug?.primary_uses || [],
    special_distinguishing_features: jsonDataKfug?.special_distinguishing_features || [],
    toxicity_information: {
        human_toxicity: jsonDataKfug?.toxicity_information?.human_toxicity || defaultToxicityDetail,
        dog_toxicity: jsonDataKfug?.toxicity_information?.dog_toxicity || defaultToxicityDetail,
        cat_toxicity: jsonDataKfug?.toxicity_information?.cat_toxicity || defaultToxicityDetail,
        other_animal_toxicity_specify: jsonDataKfug?.toxicity_information?.other_animal_toxicity_specify || null,
    },
});

const getDefaultAirTemperatureCelsius = (data?: Partial<AirTemperatureCelsius>): AirTemperatureCelsius => ({
    daytime_optimal_min: data?.daytime_optimal_min ?? defaultNum, daytime_optimal_max: data?.daytime_optimal_max ?? defaultNum,
    nighttime_optimal_min: data?.nighttime_optimal_min ?? defaultNum, nighttime_optimal_max: data?.nighttime_optimal_max ?? defaultNum,
    absolute_survival_min: data?.absolute_survival_min ?? defaultNum, absolute_survival_max: data?.absolute_survival_max ?? defaultNum,
    notes: data?.notes || defaultTextVal,
});
const getDefaultRelativeHumidityPercentage = (data?: Partial<RelativeHumidityPercentage>): RelativeHumidityPercentage => ({
    optimal_min: data?.optimal_min ?? defaultNum, optimal_max: data?.optimal_max ?? defaultNum,
    absolute_min: data?.absolute_min ?? defaultNum, absolute_max: data?.absolute_max ?? defaultNum,
    notes: data?.notes || defaultTextVal,
});
const getDefaultLightIntensityLux = (data?: Partial<LightIntensityLux>): LightIntensityLux => ({
    seedling_optimal_min: data?.seedling_optimal_min ?? null, seedling_optimal_max: data?.seedling_optimal_max ?? null,
    mature_plant_optimal_min: data?.mature_plant_optimal_min ?? null, mature_plant_optimal_max: data?.mature_plant_optimal_max ?? null,
    notes: data?.notes || defaultTextVal,
});
const getDefaultPlacementSpacing = (data?: Partial<PlacementSpacing>): PlacementSpacing => ({
    best_placement_indoors: data?.best_placement_indoors ?? null,
    best_placement_outdoors: data?.best_placement_outdoors ?? null,
    recommended_planting_spacing_meters: data?.recommended_planting_spacing_meters ?? null,
});

const getDefaultCultivationGrowingConditions = (jsonDataCgc?: Partial<CultivationGrowingConditions>): CultivationGrowingConditions => ({
    light_requirements_general: jsonDataCgc?.light_requirements_general || { recommended_exposure: defaultTextVal, minimum_daily_light_hours_mature: null, notes_on_light_mature: null },
    water_requirements_general: jsonDataCgc?.water_requirements_general || { recommended_watering_frequency_moisture_level: defaultTextVal, drought_tolerance: 'Medium', watering_notes_min_max_guidance: null },
    soil_requirements_general: jsonDataCgc?.soil_requirements_general || { preferred_soil_types: [], soil_ph_range_overall: { min: 6.0, max: 7.0, optimal: 6.5 }, soil_drainage_requirements: defaultTextVal, soil_enrichment_notes: null },
    environmental_tolerances_detailed: {
        air_temperature_celsius: getDefaultAirTemperatureCelsius(jsonDataCgc?.environmental_tolerances_detailed?.air_temperature_celsius),
        relative_humidity_percentage: getDefaultRelativeHumidityPercentage(jsonDataCgc?.environmental_tolerances_detailed?.relative_humidity_percentage),
        light_intensity_lux: getDefaultLightIntensityLux(jsonDataCgc?.environmental_tolerances_detailed?.light_intensity_lux),
        placement_spacing: getDefaultPlacementSpacing(jsonDataCgc?.environmental_tolerances_detailed?.placement_spacing),
    },
});

const getDefaultPlantNutritionFertilizationNeeds = (jsonDataPnfn?: Partial<PlantNutritionFertilizationNeeds>): PlantNutritionFertilizationNeeds => ({
    general_fertilizer_preferences: jsonDataPnfn?.general_fertilizer_preferences || null,
    phase_specific_fertilization_needs: jsonDataPnfn?.phase_specific_fertilization_needs || [],
});

const defaultGrowthStageEntry: GrowthStageTimelineEntry = { expected_min_days: defaultNum, expected_max_days: defaultNum, optimal_average_days: defaultNum, event_description_notes: defaultTextVal };
const getDefaultGrowthStageTimelines = (jsonDataGst?: Partial<GrowthStageTimelinesDaysFromSowing>): GrowthStageTimelinesDaysFromSowing => ({
    sprouting: jsonDataGst?.sprouting || { ...defaultGrowthStageEntry },
    first_true_leaves: jsonDataGst?.first_true_leaves || { ...defaultGrowthStageEntry },
    first_repotting_seedling: jsonDataGst?.first_repotting_seedling || { ...defaultGrowthStageEntry, pot_size_increase_factor_guideline: null },
    hardening_off_start: jsonDataGst?.hardening_off_start || { ...defaultGrowthStageEntry },
    transplant_outdoors_seedling: jsonDataGst?.transplant_outdoors_seedling || { ...defaultGrowthStageEntry },
    first_fertilization_after_true_leaves: jsonDataGst?.first_fertilization_after_true_leaves || { ...defaultGrowthStageEntry, trigger_condition: "N/A" },
    first_pruning_formative: jsonDataGst?.first_pruning_formative || { ...defaultGrowthStageEntry },
    flowering_start: jsonDataGst?.flowering_start || { ...defaultGrowthStageEntry },
    first_harvest_expected: jsonDataGst?.first_harvest_expected || { ...defaultGrowthStageEntry },
});

const getDefaultEcologicalInteractions = (jsonDataEi?: Partial<EcologicalInteractions>): EcologicalInteractions => ({
    pest_interactions: jsonDataEi?.pest_interactions || { pests_attracted_to_plant: [], pests_repelled_by_plant: [] },
    disease_susceptibility: jsonDataEi?.disease_susceptibility || { common_diseases: [], prevention_non_chemical_treatment_notes: null },
    pest_disease_management_specific_strategies: jsonDataEi?.pest_disease_management_specific_strategies || { natural_organic_pest_control_methods: [], chemical_pest_control_options_if_necessary: [], integrated_pest_management_ipm_strategies_for_plant: null },
    companion_planting: jsonDataEi?.companion_planting || { beneficial_companions_plants_it_aids: [], synergistic_companions_plants_that_aid_it: [], antagonistic_plants_avoid_nearby: [] },
    pollinators_wildlife_interaction: jsonDataEi?.pollinators_wildlife_interaction || { attracts_pollinators: [], provides_food_shelter_for_wildlife: [] },
});

const getDefaultFruitingHarvestingConditional = (jsonDataFhc?: Partial<FruitingHarvestingConditional>): FruitingHarvestingConditional => ({
    is_applicable: jsonDataFhc?.is_applicable || false,
    flowering_pollination_for_fruit_set: jsonDataFhc?.flowering_pollination_for_fruit_set || { flowering_time_season: null, pollination_requirements: null, cross_pollination_partners_if_applicable_ids_names: [], techniques_to_assist_pollination: null },
    fruit_vegetable_development_enhancement: jsonDataFhc?.fruit_vegetable_development_enhancement || { time_from_flower_to_harvest_typical: null, techniques_to_improve_size: null, techniques_to_improve_flavor: null, techniques_to_improve_texture: null, techniques_to_improve_juice_content: null },
    harvesting_details: jsonDataFhc?.harvesting_details || { harvesting_season_indicators_of_ripeness: null, harvesting_techniques: null, post_harvest_handling_storage_short_term: null },
});

const getDefaultUseCasesHumanSymbiosis = (jsonDataUchs?: Partial<UseCasesHumanSymbiosis>): UseCasesHumanSymbiosis => ({
    culinary_uses: jsonDataUchs?.culinary_uses || [],
    preservation_conservation_techniques_for_plant: jsonDataUchs?.preservation_conservation_techniques_for_plant || [],
    alternative_products_uses: jsonDataUchs?.alternative_products_uses || [],
    medicinal_uses_traditional_folk: jsonDataUchs?.medicinal_uses_traditional_folk || [],
    other_craft_material_uses: jsonDataUchs?.other_craft_material_uses || [],
});

const getDefaultSeedSavingStorageDetails = (jsonDataSsd?: Partial<SeedSavingStorageDetails>): SeedSavingStorageDetails => ({
    seed_viability_duration_years_optimal: jsonDataSsd?.seed_viability_duration_years_optimal || null,
    harvesting_seeds_guide: jsonDataSsd?.harvesting_seeds_guide || { timing_indicators: null, method_selection_criteria: null },
    cleaning_drying_seeds_techniques: jsonDataSsd?.cleaning_drying_seeds_techniques || null,
    optimal_storage_conditions: jsonDataSsd?.optimal_storage_conditions || { temperature_celsius: null, humidity_percent: null, container_type: null, other_notes: null },
    seed_viability_testing_methods_description: jsonDataSsd?.seed_viability_testing_methods_description || [],
});

const getDefaultPlantCareMaintenance = (jsonDataPcm?: Partial<PlantCareMaintenance>): PlantCareMaintenance => ({
    pruning_shaping: jsonDataPcm?.pruning_shaping || { pruning_objectives: [], best_times_for_pruning_seasonal: [], pruning_techniques_description: null, tools_recommended: [], pruning_notes_detailed: null },
    repotting_for_container_plants: jsonDataPcm?.repotting_for_container_plants || null,
    root_strengthening_techniques: jsonDataPcm?.root_strengthening_techniques || [],
    propagation_methods_summary: jsonDataPcm?.propagation_methods_summary || {
        primary_methods: [],
        seed_propagation_details: { is_applicable: false, brief_sowing_and_early_care_steps: [], expected_success_rate_notes: null, recommended_sowing_time_season: null, pre_germination_treatment: {soaking_seeds_details: null, scarification_details: null, stratification_details: null}, germination_requirements_detailed: { seed_depth_cm: {min:0, max:0, notes:null}, soil_temperature_celsius: {optimal_min:0, optimal_max:0, absolute_min_for_germination:0, absolute_max_for_germination:0, notes:null}, soil_mix_recommendation: defaultTextVal, soil_moisture_level_description: defaultTextVal, watering_method_germination: defaultTextVal, humidity_percentage_germination: {optimal_min:0, optimal_max:0}, light_for_germination_requirement: defaultTextVal, expected_germination_timeframe_days_range: null }, early_seedling_phase_water_management_sprout_to_8_weeks: { target_medium_moisture_level_description: null, recommended_watering_method: [], watering_frequency_guidance: null, approximate_amount_of_water_per_application: null, importance_of_good_drainage_notes: null, water_temperature_consideration_celsius: null, soil_temperature_considerations_after_watering: null, humidity_considerations_acclimation: null, signs_of_overwatering_seedlings: [], signs_of_underwatering_seedlings: [], transitioning_watering_practices_notes: null }, other_early_seedling_care_sprout_to_8_weeks: { light_requirements_for_seedlings_hours_type: null, temperature_requirements_for_seedlings_celsius: {day_min: null, day_max:null, night_min:null, night_max:null}, ventilation_needs_description: null, first_fertilization_details: null, hardening_off_procedure_within_8_weeks: null } },
        cutting_propagation_details: { is_applicable: false, cutting_types_common: [], best_time_for_cuttings_by_type: [], brief_step_by_step_overview: [], cutting_preparation_notes: null, rooting_medium_recommendations: [], environmental_conditions_for_rooting_notes: null, expected_rooting_timeframe_weeks_range: null, aftercare_once_rooted_instructions: null, expected_success_rate_notes: null, common_challenges: [] },
        grafting_propagation_details: { is_applicable: false, common_grafting_types_used: [], best_time_for_grafting_by_type: [], brief_step_by_step_overview: [], rootstock_selection_considerations: null, scion_selection_considerations: null, tools_materials_needed: [], aftercare_instructions_detailed: null, expected_success_rate_notes: null, common_challenges: [] },
    }
});

const getDefaultUserSourcingInformation = (row: FloraPediaTableRow, jsonDataUsi?: Partial<UserSourcingInformation>): UserSourcingInformation => ({
    user_notes: jsonDataUsi?.user_notes ?? null,
    date_record_created: jsonDataUsi?.date_record_created || row.created_at,
    date_record_last_modified: jsonDataUsi?.date_record_last_modified || row.updated_at,
    information_sources: jsonDataUsi?.information_sources || [],
    ai_query_log_if_applicable: jsonDataUsi?.ai_query_log_if_applicable === undefined ? null : jsonDataUsi.ai_query_log_if_applicable,
});


// For FloraPedia (Plants)
export const mapFloraPediaRowToPlant = (row: FloraPediaTableRow): Plant => {
  const jsonData = (row.data as { [key: string]: any }) || {};

  // Construct the single source of truth for identification from the row and its JSONB data.
  const pio = getDefaultPlantIdentificationOverview(row, jsonData.plant_identification_overview);

  return {
    id: row.id,
    parent_plant_id: row.parent_plant_id || undefined,
    display_image_url: jsonData.display_image_url || null,
    image_object_position_y: jsonData.image_object_position_y === undefined ? 50 : jsonData.image_object_position_y,
    plant_identification_overview: pio,
    key_features_uses_general: getDefaultKeyFeaturesUsesGeneral(jsonData.key_features_uses_general),
    cultivation_growing_conditions: getDefaultCultivationGrowingConditions(jsonData.cultivation_growing_conditions),
    plant_nutrition_fertilization_needs: getDefaultPlantNutritionFertilizationNeeds(jsonData.plant_nutrition_fertilization_needs),
    plant_care_maintenance: getDefaultPlantCareMaintenance(jsonData.plant_care_maintenance),
    growth_stage_timelines_days_from_sowing: getDefaultGrowthStageTimelines(jsonData.growth_stage_timelines_days_from_sowing),
    ecological_interactions: getDefaultEcologicalInteractions(jsonData.ecological_interactions),
    fruiting_harvesting_conditional: getDefaultFruitingHarvestingConditional(jsonData.fruiting_harvesting_conditional),
    annual_care_calendar_timeline_summary: jsonData.annual_care_calendar_timeline_summary || [],
    use_cases_human_symbiosis: getDefaultUseCasesHumanSymbiosis(jsonData.use_cases_human_symbiosis),
    seed_saving_storage_details: getDefaultSeedSavingStorageDetails(jsonData.seed_saving_storage_details),
    user_sourcing_information: getDefaultUserSourcingInformation(row, jsonData.user_sourcing_information),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const mapPlantToFloraPediaRow = (plant: Partial<Plant>): Omit<FloraPediaTableRow, 'id' | 'created_at' | 'updated_at'> => {
  // Destructure all known top-level properties of the Plant interface
  const {
      id, created_at, updated_at,
      plant_identification_overview,
      // The rest of the properties are part of the 'data' JSONB column
      ...jsonData
  } = plant;

  // Extract fields that are direct columns in the flora_pedia table
  const {
      latin_name_scientific_name,
      common_names,
      plant_family,
      plant_type_category,
      description_brief,
      cultivar_variety,
      growth_structure_habit,
      life_cycle
  } = plant_identification_overview || {};
  
  // Construct the row for insertion/updating
  const row: Omit<FloraPediaTableRow, 'id' | 'created_at' | 'updated_at'> = {
      latin_name_scientific_name: latin_name_scientific_name || 'N/A',
      common_names: common_names || [],
      plant_family: plant_family || null,
      plant_type_category: plant_type_category || null,
      description_brief: description_brief || null,
      cultivar_variety: cultivar_variety || null,
      parent_plant_id: plant.parent_plant_id || null,
      growth_structure_habit: growth_structure_habit || null,
      life_cycle: life_cycle || null,
      data: jsonData as Json,
  };

  return row;
};

export const mapPlantToPlantListItemData = (plant: Plant): PlantListItemData => ({
  id: plant.id,
  commonName: plant.plant_identification_overview.common_names[0] || 'Unnamed Plant',
  scientificName: plant.plant_identification_overview.latin_name_scientific_name,
  imageUrl: plant.display_image_url,
  imagePosY: plant.image_object_position_y,
  family: plant.plant_identification_overview.plant_family,
  typeCategory: plant.plant_identification_overview.plant_type_category,
  updatedAt: plant.updated_at,
});

export const getPlants = async (): Promise<Plant[]> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase.from('flora_pedia').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(mapFloraPediaRowToPlant);
};

export const addPlant = async (plantData: Omit<Plant, 'id' | 'created_at' | 'updated_at'>): Promise<Plant> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const processedPlantData = { ...plantData };
    if (processedPlantData.display_image_url && processedPlantData.display_image_url.startsWith('data:image')) {
        const imageName = `${Date.now()}-${(processedPlantData.plant_identification_overview.common_names[0] || 'plant').replace(/\s+/g, '-')}.jpg`;
        processedPlantData.display_image_url = await uploadBase64Image('plant-images', `public/${imageName}`, processedPlantData.display_image_url);
    }
    
    const rowToInsert = mapPlantToFloraPediaRow(processedPlantData);
    
    const { data, error } = await supabase.from('flora_pedia').insert(rowToInsert).select().single();
    if (error) throw error;
    return mapFloraPediaRowToPlant(data);
};

export const updatePlant = async (plantId: string, updates: Partial<Plant>): Promise<Plant> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const processedUpdates = { ...updates };
    if (processedUpdates.display_image_url && processedUpdates.display_image_url.startsWith('data:image')) {
        const imageName = `${Date.now()}-${(processedUpdates.plant_identification_overview?.common_names?.[0] || plantId).replace(/\s+/g, '-')}.jpg`;
        processedUpdates.display_image_url = await uploadBase64Image('plant-images', `public/${imageName}`, processedUpdates.display_image_url);
    }

    const { data: existingData, error: fetchError } = await supabase.from('flora_pedia').select().eq('id', plantId).single();
    if (fetchError) throw fetchError;

    const existingPlant = mapFloraPediaRowToPlant(existingData);
    const mergedPlant = deepMerge(existingPlant, processedUpdates);
    const rowToUpdate = mapPlantToFloraPediaRow(mergedPlant);

    const { data, error } = await supabase.from('flora_pedia').update(rowToUpdate).eq('id', plantId).select().single();
    if (error) throw error;
    return mapFloraPediaRowToPlant(data);
};

// ... other services ...

// User Profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) throw new Error("Supabase client not available.");
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw error;
  }
  return data as UserProfile | null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  if (!supabase) throw new Error("Supabase client not available.");
  
  const processedUpdates = { ...updates };
  if (processedUpdates.avatar_url && processedUpdates.avatar_url.startsWith('data:image')) {
      const avatarPath = `public/${userId}/avatar.jpg`;
      processedUpdates.avatar_url = await uploadBase64Image('avatars', avatarPath, processedUpdates.avatar_url);
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(processedUpdates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}


// Fertilizers
export const getFertilizers = async (): Promise<Fertilizer[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase.from('nutri_base').select('*').order('fertilizer_name', { ascending: true });
    if (error) throw error;
    return data.map(row => ({ ...row, data: row.data as FertilizerData })) as Fertilizer[];
};
export const addFertilizer = async (fertilizerData: FertilizerInput): Promise<Fertilizer> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    let imageUrl = fertilizerData.imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
        const imageName = `${Date.now()}-${fertilizerData.name.replace(/\s+/g, '-')}.jpg`;
        imageUrl = await uploadBase64Image('item-images', `public/fertilizers/${imageName}`, imageUrl);
    }
    const { data, error } = await supabase.from('nutri_base').insert({
        fertilizer_name: fertilizerData.name,
        type: fertilizerData.type || 'Other',
        form: fertilizerData.form || 'Other',
        data: {
            description: fertilizerData.description || "No description provided.",
            imageUrl: imageUrl || null,
            image_object_position_y: fertilizerData.image_object_position_y || 50
        }
    }).select().single();
    if (error) throw error;
    return { ...data, data: data.data as FertilizerData } as Fertilizer;
};
export const updateFertilizer = async (id: string, updates: Partial<Fertilizer>): Promise<Fertilizer> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
     if (updates.data?.imageUrl && updates.data.imageUrl.startsWith('data:image')) {
        const imageName = `${Date.now()}-${(updates.fertilizer_name || id).replace(/\s+/g, '-')}.jpg`;
        updates.data.imageUrl = await uploadBase64Image('item-images', `public/fertilizers/${imageName}`, updates.data.imageUrl);
    }
    const { data, error } = await supabase.from('nutri_base').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return { ...data, data: data.data as FertilizerData } as Fertilizer;
};

// Composting Methods
export const getCompostingMethods = async (): Promise<CompostingMethod[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase.from('compost_corner').select('*').order('method_name', { ascending: true });
    if (error) throw error;
    return data.map(row => ({ ...row, data: row.data as CompostingMethodData })) as CompostingMethod[];
};
export const addCompostingMethod = async (methodData: CompostingMethodInput): Promise<CompostingMethod> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    let imageUrl = methodData.imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
        const imageName = `${Date.now()}-${methodData.name.replace(/\s+/g, '-')}.jpg`;
        imageUrl = await uploadBase64Image('item-images', `public/compost-methods/${imageName}`, imageUrl);
    }
    const { data, error } = await supabase.from('compost_corner').insert({
        method_name: methodData.name,
        primary_composting_approach: methodData.approach || 'Other',
        scale_of_operation: 'Medium (Home Garden)',
        data: {
            description: methodData.description || "No description provided.",
            imageUrl: imageUrl || null,
            image_object_position_y: methodData.image_object_position_y || 50,
        }
    }).select().single();
    if (error) throw error;
    return { ...data, data: data.data as CompostingMethodData } as CompostingMethod;
};
export const updateCompostingMethod = async (id: string, updates: Partial<CompostingMethod>): Promise<CompostingMethod> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    if (updates.data?.imageUrl && updates.data.imageUrl.startsWith('data:image')) {
        const imageName = `${Date.now()}-${(updates.method_name || id).replace(/\s+/g, '-')}.jpg`;
        updates.data.imageUrl = await uploadBase64Image('item-images', `public/compost-methods/${imageName}`, updates.data.imageUrl);
    }
    const { data, error } = await supabase.from('compost_corner').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return { ...data, data: data.data as CompostingMethodData } as CompostingMethod;
};

// Growing Grounds
export const getGrowingGrounds = async (userId?: string): Promise<GrowingGround[]> => {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase.from('growing_grounds').select('*').eq('user_id', userId).order('name', { ascending: true });
    if (error) throw error;
    return data.map(row => ({ ...row.data, id: row.id, name: row.name, created_at: row.created_at, updated_at: row.updated_at })) as GrowingGround[];
};
export const addGrowingGround = async (groundInput: GrowingGroundInput, userId: string): Promise<GrowingGround> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    let imageUrl = groundInput.imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
        const imageName = `${Date.now()}-${groundInput.name.replace(/\s+/g, '-')}.jpg`;
        imageUrl = await uploadBase64Image('ground-images', `user/${userId}/${imageName}`, imageUrl);
    }
    const newGroundData: GrowingGroundData = {
        description: groundInput.description || "A new growing ground.",
        type: groundInput.type || 'Other',
        imageUrl: imageUrl || null,
        image_object_position_y: groundInput.image_object_position_y || 50,
        lightHoursMorning: 0,
        lightHoursAfternoon: 0,
        soilType: 'Loamy',
        plants: [],
        logs: []
    };
    const { data, error } = await supabase.from('growing_grounds').insert({
        name: groundInput.name,
        user_id: userId,
        data: newGroundData
    }).select().single();
    if (error) throw error;
    return { ...data.data as GrowingGroundData, id: data.id, name: data.name, created_at: data.created_at, updated_at: data.updated_at };
};
export const updateGrowingGround = async (id: string, updates: Partial<GrowingGround>): Promise<GrowingGround> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { user } = (await supabase.auth.getUser()).data;
    if (updates.imageUrl && updates.imageUrl.startsWith('data:image') && user) {
        const imageName = `${Date.now()}-${(updates.name || id).replace(/\s+/g, '-')}.jpg`;
        updates.imageUrl = await uploadBase64Image('ground-images', `user/${user.id}/${imageName}`, updates.imageUrl);
    }
    const { name, created_at, updated_at, id: groundId, ...data } = updates;
    const { data: updatedData, error } = await supabase.from('growing_grounds').update({ name, data }).eq('id', id).select().single();
    if (error) throw error;
    return { ...updatedData.data as GrowingGroundData, id: updatedData.id, name: updatedData.name, created_at: updatedData.created_at, updated_at: updatedData.updated_at };
};
export const deleteGrowingGround = async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await supabase.from('growing_grounds').delete().eq('id', id);
    if (error) throw error;
};

// Recent Views
export const getRecentViews = async (userId?: string): Promise<RecentViewItem[]> => {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase.from('user_view_history').select('*').eq('user_id', userId).order('viewed_at', { ascending: false }).limit(20);
    if (error) throw error;
    return data;
};
export const addRecentView = async (itemId: string, itemType: ItemTypeForRecentView, itemName: string, itemImageUrl: string | null, itemModuleId: ActiveModuleType): Promise<void> => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('user_view_history').upsert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        item_name: itemName,
        item_image_url: itemImageUrl,
        item_module_id: itemModuleId,
        viewed_at: new Date().toISOString()
    }, { onConflict: 'user_id, item_id' });
};

// Seasonal Tips
export const mapSeasonalTipToListItemData = (tip: SeasonalTip): SeasonalTipListItemData => ({
  id: tip.id,
  title: tip.title,
  description: tip.description,
  imageUrl: tip.images?.[0]?.url,
  imagePosY: tip.images?.[0]?.object_position_y,
  tags: tip.tags,
  publishedAt: tip.published_at || tip.created_at,
  updatedAt: tip.updated_at,
});
export const getSeasonalTips = async (): Promise<SeasonalTip[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase.from('seasonal_tips').select('*').order('published_at', { ascending: false });
    if (error) throw error;
    return data.map(d => ({...d, images: d.images as TipImage[]}));
};
export const addSeasonalTip = async (tipInput: SeasonalTipInput): Promise<SeasonalTip> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const processedImages = await Promise.all(
        (tipInput.images || []).map(async (img, index) => {
            if (img.url.startsWith('data:image')) {
                const imageName = `${Date.now()}-tip-${tipInput.title.replace(/\s+/g, '-')}-${index}.jpg`;
                const newUrl = await uploadBase64Image('tip-images', `public/${imageName}`, img.url);
                return { ...img, url: newUrl };
            }
            return img;
        })
    );
    const { data, error } = await supabase.from('seasonal_tips').insert({
        ...tipInput,
        images: processedImages,
        published_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return { ...data, images: data.images as TipImage[] };
};
export const updateSeasonalTip = async (id: string, updates: Partial<SeasonalTipInput>): Promise<SeasonalTip> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    if (updates.images) {
        updates.images = await Promise.all(
            updates.images.map(async (img, index) => {
                if (img.url.startsWith('data:image')) {
                    const imageName = `${Date.now()}-tip-${(updates.title || id).replace(/\s+/g, '-')}-${index}.jpg`;
                    const newUrl = await uploadBase64Image('tip-images', `public/${imageName}`, img.url);
                    return { ...img, url: newUrl };
                }
                return img;
            })
        );
    }
    const { data, error } = await supabase.from('seasonal_tips').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return { ...data, images: data.images as TipImage[] };
};

// Seeding
export const seedInitialData = async () => {
    if (!supabase) return;
    const { data: plants } = await supabase.from('flora_pedia').select('id').limit(1);
    if (!plants || plants.length === 0) {
        console.log("Seeding FloraPedia...");
        const rowsToInsert = INITIAL_PLANTS_DATA_FOR_SEEDING.map(p => mapPlantToFloraPediaRow(p as Plant));
        await supabase.from('flora_pedia').upsert(rowsToInsert, { onConflict: 'latin_name_scientific_name' });
    }
    const { data: ferts } = await supabase.from('nutri_base').select('id').limit(1);
    if (!ferts || ferts.length === 0) {
        console.log("Seeding NutriBase...");
        await supabase.from('nutri_base').upsert(INITIAL_FERTILIZERS_DATA_FOR_SEEDING as any, { onConflict: 'fertilizer_name' });
    }
    const { data: composts } = await supabase.from('compost_corner').select('id').limit(1);
    if (!composts || composts.length === 0) {
        console.log("Seeding CompostCorner...");
        await supabase.from('compost_corner').upsert(INITIAL_COMPOSTING_METHODS_DATA_FOR_SEEDING as any, { onConflict: 'method_name' });
    }
};

// Calendar and Events
export const getEventTypes = async (): Promise<EventType[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('event_types').select('*');
    if (error) throw error;
    return data;
};
export const seedEventTypes = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('event_types').select('id').limit(1);
    if (error) throw error;
    if (!data || data.length === 0) {
        console.log("Seeding event types...");
        const { error: insertError } = await supabase.from('event_types').insert(EVENT_TYPES_SEED_DATA);
        if (insertError) throw insertError;
    }
};
export const getCalendarEvents = async (userId?: string): Promise<CalendarEventViewModel[]> => {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase.from('calendar_events').select(`*, event_types(*), growing_ground_events(growing_ground_id)`).eq('user_id', userId);
    if (error) throw error;

    const today = new Date();
    today.setHours(0,0,0,0);

    return data.map(event => {
        let status: CalendarEventViewModel['status'] = 'Pending';
        const eventDate = new Date(event.start_date);
        eventDate.setHours(0,0,0,0);

        if (event.is_completed) {
            status = 'Completed';
        } else if (eventDate < today) {
            status = 'Overdue';
        }
        return {
            ...event,
            event_types: event.event_types as EventType,
            ground_ids: (event.growing_ground_events as any[]).map(gge => gge.growing_ground_id),
            status: status
        };
    });
};
export const addCalendarEvent = async ({event, groundId}: {event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'event_types'>, groundId?: string }): Promise<CalendarEvent> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase.from('calendar_events').insert(event).select().single();
    if (error) throw error;
    if (groundId) {
        await supabase.from('growing_ground_events').insert({ growing_ground_id: groundId, calendar_event_id: data.id });
    }
    return data;
};
export const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase.from('calendar_events').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};
export const deleteCalendarEvent = async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    await supabase.from('growing_ground_events').delete().eq('calendar_event_id', id); // Cascade delete links first
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) throw error;
};
