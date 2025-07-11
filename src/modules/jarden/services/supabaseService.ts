





import { supabase } from '../../../../services/supabase';
import {
  Plant, PlantInput, Fertilizer, FertilizerInput, CompostingMethod, CompostingMethodInput,
  PestGuardian, GrowHowTechnique, FloraPediaTableRow, PlantIdentificationOverview,
  GrowingGround, GrowingGroundInput, GrowingGroundData, KeyFeaturesUsesGeneral, CultivationGrowingConditions, PlantNutritionFertilizationNeeds, PlantCareMaintenance, GrowthStageTimelinesDaysFromSowing, EcologicalInteractions, FruitingHarvestingConditional, UseCasesHumanSymbiosis, SeedSavingStorageDetails, LightRequirementsGeneral, WaterRequirementsGeneral, SoilRequirementsGeneral, EnvironmentalTolerancesDetailed, AirTemperatureCelsius, RelativeHumidityPercentage, LightIntensityLux, PlacementSpacing, ToxicityDetail, TextRange, HardinessZones, PruningShaping, RepottingForContainerPlants, PropagationMethodsSummary, SeedPropagationDetails, CuttingPropagationDetails, GraftingPropagationDetails, GrowthStageTimelineEntry, PestInteractions, DiseaseSusceptibility, PestDiseaseManagementSpecificStrategies, CompanionPlanting, PollinatorsWildlifeInteraction, FloweringPollinationForFruitSet, FruitVegetableDevelopmentEnhancement, HarvestingDetails, CulinaryUseItem, PreservationConservationTechnique, AlternativeProductUseItem, MedicinalUseItem, SeedSavingHarvestingGuide, OptimalSeedStorageConditions, FertilizerData, CompostingMethodData, RecentViewItem, ItemTypeForRecentView, ActiveModuleType, SeasonalTip, SeasonalTipInput, UserSourcingInformation, UserProfile, TipImage, GroundLogEntry
} from '../types';
import { PlantListItemData, SeasonalTipListItemData } from './idbServiceTypes'; 
import { produce } from 'https://esm.sh/immer@10.0.3' ;
import { INITIAL_PLANTS_DATA_FOR_SEEDING, INITIAL_FERTILIZERS_DATA_FOR_SEEDING, INITIAL_COMPOSTING_METHODS_DATA_FOR_SEEDING } from './supabaseSeedData';
import { decode } from 'base64-arraybuffer';
import { deepMerge, isObject } from '../utils/objectUtils';


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
  const jsonData = row.data || {};

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
  const {
    id, created_at, updated_at, 
    parent_plant_id: direct_parent_plant_id,
    display_image_url,
    image_object_position_y,
    plant_identification_overview: pioSource, 
    key_features_uses_general,
    cultivation_growing_conditions,
    plant_nutrition_fertilization_needs,
    plant_care_maintenance,
    growth_stage_timelines_days_from_sowing,
    ecological_interactions,
    fruiting_harvesting_conditional,
    annual_care_calendar_timeline_summary,
    use_cases_human_symbiosis,
    seed_saving_storage_details,
    user_sourcing_information,
    ...otherJsonData 
  } = plant;

  const ln = pioSource?.latin_name_scientific_name ?? "Unknown latin name";
  const cn = pioSource?.common_names ?? [];
  const pf = pioSource?.plant_family ?? null;
  const ptc = pioSource?.plant_type_category ?? null;
  const db = pioSource?.description_brief ?? null;
  const cv = pioSource?.cultivar_variety ?? null;
  const ppid = direct_parent_plant_id ?? null;
  const gsh = pioSource?.growth_structure_habit ?? null;
  const lc = pioSource?.life_cycle ?? null;
  
  const dataForJsonB: FloraPediaTableRow['data'] = {
    display_image_url: display_image_url, 
    image_object_position_y: image_object_position_y === undefined ? 50 : image_object_position_y,
    plant_identification_overview: pioSource, 
    key_features_uses_general,
    cultivation_growing_conditions,
    plant_nutrition_fertilization_needs,
    plant_care_maintenance,
    growth_stage_timelines_days_from_sowing,
    ecological_interactions,
    fruiting_harvesting_conditional,
    annual_care_calendar_timeline_summary,
    use_cases_human_symbiosis,
    seed_saving_storage_details,
    user_sourcing_information,
    ...otherJsonData, 
  };

  return {
    latin_name_scientific_name: ln,
    common_names: cn,
    plant_family: pf,
    plant_type_category: ptc,
    description_brief: db,
    cultivar_variety: cv,
    parent_plant_id: ppid,
    growth_structure_habit: gsh,
    life_cycle: lc,
    data: dataForJsonB,
  };
};


// --- FloraPedia (Plants) Service ---
export const getPlants = async (): Promise<Plant[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('flora_pedia').select('*');
  if (error) throw new Error(error.message);
  return data.map(mapFloraPediaRowToPlant);
};

export const addPlant = async (plantData: Omit<Plant, 'id' | 'created_at' | 'updated_at'>): Promise<Plant> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  let plantDataForUpsert = { ...plantData };
  const base64Image = plantData.display_image_url;

  if (base64Image && base64Image.startsWith('data:image')) {
    plantDataForUpsert.display_image_url = null;
  }
  plantDataForUpsert.image_object_position_y = plantData.image_object_position_y ?? 50;

  const rowToUpsert = mapPlantToFloraPediaRow(plantDataForUpsert);

  const { data: upsertedData, error: upsertError } = await supabase
    .from('flora_pedia')
    .upsert([rowToUpsert], { onConflict: 'latin_name_scientific_name' }) 
    .select()
    .single();

  if (upsertError) throw new Error(upsertError.message);
  if (!upsertedData) throw new Error("Failed to add plant: no data returned from upsert.");

  let finalPlantData = upsertedData as FloraPediaTableRow;

  if (base64Image && base64Image.startsWith('data:image')) {
    try {
      const imagePath = `plants/${finalPlantData.id}/${Date.now()}_image.png`;
      const uploadedImageUrl = await uploadBase64Image('flora-pedia-images', imagePath, base64Image);
      
      const updatedJsonData = { ...finalPlantData.data, display_image_url: uploadedImageUrl, image_object_position_y: 50 };
      
      const { data: updatedPlantWithImage, error: updateImageError } = await supabase
        .from('flora_pedia')
        .update({ data: updatedJsonData })
        .eq('id', finalPlantData.id)
        .select()
        .single();
      
      if (updateImageError) throw new Error(updateImageError.message);
      if (!updatedPlantWithImage) throw new Error("Failed to update plant with image URL.");
      finalPlantData = updatedPlantWithImage as FloraPediaTableRow;
    } catch (imageError) {
      console.error("Error uploading plant image after insert, plant created without image:", imageError);
    }
  }
  
  return mapFloraPediaRowToPlant(finalPlantData);
};

export const updatePlant = async (plantId: string, updates: Partial<Plant>): Promise<Plant> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data: existingRow, error: fetchError } = await supabase
    .from('flora_pedia')
    .select('*')
    .eq('id', plantId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!existingRow) throw new Error(`Plant with ID ${plantId} not found.`);

  const directColumns: (keyof Plant)[] = [ 'parent_plant_id' ];
  
  const payload: { [key: string]: any } = {};
  const dataUpdates: { [key: string]: any } = {};

  // Separate updates for direct columns and the JSONB 'data' column
  for (const key in updates) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      const typedKey = key as keyof Plant;
      if (directColumns.includes(typedKey)) {
        payload[key] = (updates as any)[key];
      } else {
        // All other updates go into the data object
        dataUpdates[key] = (updates as any)[key];
      }
    }
  }

  // Handle image upload if a new base64 image is provided
  if (dataUpdates.display_image_url && dataUpdates.display_image_url.startsWith('data:image')) {
    try {
      const imagePath = `plants/${plantId}/${Date.now()}_image.png`;
      const uploadedImageUrl = await uploadBase64Image('flora-pedia-images', imagePath, dataUpdates.display_image_url);
      dataUpdates.display_image_url = uploadedImageUrl;
      if (dataUpdates.image_object_position_y === undefined) {
        dataUpdates.image_object_position_y = 50;
      }
    } catch (imageError) {
      console.error(`Failed to upload new image for plant ${plantId}. Proceeding with other updates.`, imageError);
      // Revert to existing image URL if upload fails
      dataUpdates.display_image_url = existingRow.data.display_image_url;
    }
  }

  // If there are updates for the 'data' column, deep merge them
  if (Object.keys(dataUpdates).length > 0) {
    // CRITICAL FIX: Use deepMerge to prevent data loss in nested JSON
    payload.data = deepMerge(existingRow.data || {}, dataUpdates);

    // After merging, update direct columns from the new data object for consistency
    const pio = payload.data.plant_identification_overview;
    if (pio) {
        payload.latin_name_scientific_name = pio.latin_name_scientific_name;
        payload.common_names = pio.common_names;
        payload.plant_family = pio.plant_family;
        payload.plant_type_category = pio.plant_type_category;
        payload.description_brief = pio.description_brief;
        payload.cultivar_variety = pio.cultivar_variety;
        payload.growth_structure_habit = pio.growth_structure_habit;
        payload.life_cycle = pio.life_cycle;
    }
  }
  
  if (Object.keys(payload).length === 0) {
     return mapFloraPediaRowToPlant(existingRow as FloraPediaTableRow);
  }

  const { data: updatedData, error: updateError } = await supabase
    .from('flora_pedia')
    .update(payload)
    .eq('id', plantId)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);
  if (!updatedData) throw new Error("Failed to update plant: no data returned.");
  
  return mapFloraPediaRowToPlant(updatedData as FloraPediaTableRow);
};


export const deletePlant = async (plantId: string): Promise<void> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { error } = await supabase.from('flora_pedia').delete().eq('id', plantId);
  if (error) throw new Error(error.message);
};

// --- NutriBase (Fertilizers) Service ---
export const getFertilizers = async (): Promise<Fertilizer[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('nutri_base').select('*');
  if (error) throw new Error(error.message);
  return data as Fertilizer[];
};

export const addFertilizer = async (fertilizerInput: FertilizerInput): Promise<Fertilizer> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  let imageUrl = fertilizerInput.imageUrl || null;
  if (imageUrl && imageUrl.startsWith('data:image')) {
    const imagePath = `fertilizers/${Date.now()}_${fertilizerInput.name.replace(/\s+/g, '_')}.png`;
    imageUrl = await uploadBase64Image('fertilizer-images', imagePath, imageUrl);
  }

  const newFertilizerData: FertilizerData = {
    description: fertilizerInput.description || 'No description provided.',
    primaryUses: '',
    ingredients: '',
    applicationMethods: '',
    releaseProfile: 'Medium', 
    storageRequirements: '',
    safetyPrecautions: '',
    imageUrl: imageUrl,
    image_object_position_y: fertilizerInput.image_object_position_y === undefined ? 50 : fertilizerInput.image_object_position_y,
  };

  const newFertilizer: Omit<Fertilizer, 'id' | 'created_at' | 'updated_at'> = {
    fertilizer_name: fertilizerInput.name,
    type: fertilizerInput.type || 'Other',
    form: fertilizerInput.form || 'Other',
    data: newFertilizerData,
  };

  const { data, error } = await supabase.from('nutri_base').insert([newFertilizer]).select().single();
  if (error) throw new Error(error.message);
  return data as Fertilizer;
};

export const updateFertilizer = async (fertilizerId: string, updates: Partial<Fertilizer>): Promise<Fertilizer> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  
  const { data: existingRow, error: fetchError } = await supabase
    .from('nutri_base')
    .select('*')
    .eq('id', fertilizerId)
    .single();

  if (fetchError) throw new Error(`Fetch fertilizer for update failed: ${fetchError.message}`);

  let payload = { ...updates };

  if (updates.data?.imageUrl && updates.data.imageUrl.startsWith('data:image')) {
    const imagePath = `fertilizers/${fertilizerId}/${Date.now()}_image.png`;
    const uploadedUrl = await uploadBase64Image('fertilizer-images', imagePath, updates.data.imageUrl);
    payload = produce(payload, draft => {
        if (draft.data) {
            draft.data.imageUrl = uploadedUrl;
             if (updates.data?.image_object_position_y === undefined) {
                draft.data.image_object_position_y = 50;
            }
        }
    });
  }
  
  if (payload.data) {
    payload.data = deepMerge(existingRow.data || {}, payload.data);
  }

  const { data, error } = await supabase
    .from('nutri_base')
    .update(payload)
    .eq('id', fertilizerId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Fertilizer;
};

// --- CompostCorner Service ---
export const getCompostingMethods = async (): Promise<CompostingMethod[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('compost_corner').select('*');
  if (error) throw new Error(error.message);
  return data as CompostingMethod[];
};

export const addCompostingMethod = async (methodInput: CompostingMethodInput): Promise<CompostingMethod> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  let imageUrl = methodInput.imageUrl || null;
  if (imageUrl && imageUrl.startsWith('data:image')) {
    const imagePath = `composting_methods/${Date.now()}_${methodInput.name.replace(/\s+/g, '_')}.png`;
    imageUrl = await uploadBase64Image('compost-method-images', imagePath, imageUrl);
  }

  const newMethodData: CompostingMethodData = {
    description: methodInput.description || 'No description provided.',
    complexity: 'Beginner',
    timeToMature: '',
    systemDesignSetup: '',
    inputMaterialsGreen: '',
    inputMaterialsBrown: '',
    materialsToStrictlyAvoid: '',
    processManagement: '',
    troubleshootingCommonIssues: '',
    finishedCompostCharacteristics: '',
    harvestingAndUsingCompost: '',
    environmentalBenefits: '',
    imageUrl: imageUrl,
    image_object_position_y: methodInput.image_object_position_y === undefined ? 50 : methodInput.image_object_position_y,
  };
  const newMethod: Omit<CompostingMethod, 'id' | 'created_at' | 'updated_at'> = {
    method_name: methodInput.name,
    primary_composting_approach: methodInput.approach || 'Other',
    scale_of_operation: 'Medium (Home Garden)', 
    data: newMethodData,
  };
  const { data, error } = await supabase.from('compost_corner').insert([newMethod]).select().single();
  if (error) throw new Error(error.message);
  return data as CompostingMethod;
};

export const updateCompostingMethod = async (methodId: string, updates: Partial<CompostingMethod>): Promise<CompostingMethod> => {
 if (!supabase) throw new Error("Supabase client not initialized.");

 const { data: existingRow, error: fetchError } = await supabase
    .from('compost_corner')
    .select('*')
    .eq('id', methodId)
    .single();

 if (fetchError) throw new Error(`Fetch composting method for update failed: ${fetchError.message}`);

 let payload = { ...updates };

  if (updates.data?.imageUrl && updates.data.imageUrl.startsWith('data:image')) {
    const imagePath = `composting_methods/${methodId}/${Date.now()}_image.png`;
    const uploadedUrl = await uploadBase64Image('compost-method-images', imagePath, updates.data.imageUrl);
    payload = produce(payload, draft => {
        if (draft.data) {
            draft.data.imageUrl = uploadedUrl;
            if (updates.data?.image_object_position_y === undefined) {
                draft.data.image_object_position_y = 50;
            }
        }
    });
  }

  if (payload.data) {
    payload.data = deepMerge(existingRow.data || {}, payload.data);
  }

  const { data, error } = await supabase
    .from('compost_corner')
    .update(payload)
    .eq('id', methodId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as CompostingMethod;
};

// --- GrowingGrounds Service ---
export const getGrowingGrounds = async (): Promise<GrowingGround[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('growing_grounds').select('*');
  if (error) throw new Error(error.message);
  return data.map(row => {
    const groundData = row.data || {};
    return {
      ...groundData,
      id: row.id,
      name: row.name,
      // Ensure essential arrays are not undefined
      plants: groundData.plants || [],
      logs: groundData.logs || [],
      calendarTasks: groundData.calendarTasks || [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }) as GrowingGround[];
};

export const addGrowingGround = async (groundInput: GrowingGroundInput, userId: string): Promise<GrowingGround> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  let imageUrl = groundInput.imageUrl || null;
  if (imageUrl && imageUrl.startsWith('data:image')) {
    const imagePath = `growing_grounds/${userId}/${Date.now()}_${groundInput.name.replace(/\s+/g, '_')}.png`;
    imageUrl = await uploadBase64Image('growing-grounds-gallery-images', imagePath, imageUrl);
  }

  const newGroundData: GrowingGroundData = {
    description: groundInput.description || 'A new growing area.',
    type: groundInput.type || 'Other',
    imageUrl: imageUrl,
    image_object_position_y: groundInput.image_object_position_y === undefined ? 50 : groundInput.image_object_position_y,
    lightHoursMorning: 0,
    lightHoursAfternoon: 0,
    soilType: 'Loamy', 
    plants: [],
    logs: [],
    calendarTasks: [],
  };
  const { data, error } = await supabase
    .from('growing_grounds')
    .insert([{ name: groundInput.name, data: newGroundData, user_id: userId }]) 
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    name: data.name,
    ...data.data,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as GrowingGround;
};

export const updateGrowingGround = async (groundId: string, updates: Partial<GrowingGround>): Promise<GrowingGround> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const { data: existingRow, error: fetchError } = await supabase
        .from('growing_grounds')
        .select('name, data')
        .eq('id', groundId)
        .single();
    if (fetchError) throw new Error(`Fetch ground for update failed: ${fetchError.message}`);

    const payload: { name?: string; data?: any } = {};
    const { id, created_at, updated_at, ...restOfUpdates } = updates;
    const { name, ...dataUpdates } = restOfUpdates as any;

    if (name !== undefined && name !== existingRow.name) {
        payload.name = name;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'unknown_user';

    if (dataUpdates.imageUrl && typeof dataUpdates.imageUrl === 'string' && dataUpdates.imageUrl.startsWith('data:image')) {
        const imagePath = `growing_grounds/${userId}/${groundId}/hero_${Date.now()}.png`;
        dataUpdates.imageUrl = await uploadBase64Image('growing-grounds-gallery-images', imagePath, dataUpdates.imageUrl);
        if (updates.image_object_position_y === undefined) {
             dataUpdates.image_object_position_y = 50;
        }
    }

    if (dataUpdates.logs && Array.isArray(dataUpdates.logs)) {
        dataUpdates.logs = await Promise.all(dataUpdates.logs.map(async (log: GroundLogEntry) => {
            if(log.photoUrls && Array.isArray(log.photoUrls)){
                const processedUrls = await Promise.all(log.photoUrls.map(async (url, index) => {
                    if (url.startsWith('data:image')) {
                        const logId = log.id || Date.now();
                        const imagePath = `growing_grounds/${userId}/${groundId}/log_${logId}_${index}.png`;
                        return uploadBase64Image('growing-grounds-gallery-images', imagePath, url);
                    }
                    return url;
                }));
                return { ...log, photoUrls: processedUrls };
            }
            return log;
        }));
    }

    const finalData = deepMerge(existingRow.data || {}, dataUpdates);
    payload.data = finalData;

    if (Object.keys(payload).length === 0) {
        return {
            id: groundId,
            name: existingRow.name,
            ...existingRow.data,
            created_at: '', // Satisfy type, not returned from this branch
            updated_at: '', // Satisfy type, not returned from this branch
        } as GrowingGround;
    }
    
    const { data: updatedData, error: updateError } = await supabase
        .from('growing_grounds')
        .update(payload)
        .eq('id', groundId)
        .select()
        .single();

    if (updateError) throw new Error(`Update ground failed: ${updateError.message}`);

    return {
        id: updatedData.id,
        name: updatedData.name,
        ...updatedData.data,
    } as GrowingGround;
};


export const deleteGrowingGround = async (groundId: string): Promise<void> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { error } = await supabase.from('growing_grounds').delete().eq('id', groundId);
  if (error) throw new Error(error.message);
};


// --- Recent Views Service ---
export const getRecentViews = async (limit = 10): Promise<RecentViewItem[]> => {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_view_history')
    .select('*')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data as RecentViewItem[];
};

export const addRecentView = async (
  itemId: string,
  itemType: ItemTypeForRecentView,
  itemName: string,
  itemImageUrl: string | null,
  itemModuleId: ActiveModuleType
): Promise<RecentViewItem> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated to add recent view.");

  const newView = {
    user_id: user.id,
    item_id: itemId,
    item_type: itemType,
    item_name: itemName,
    item_image_url: itemImageUrl,
    item_module_id: itemModuleId,
    viewed_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('user_view_history').insert([newView]).select().single();
  if (error) throw new Error(error.message);
  return data as RecentViewItem;
};


// --- Seasonal Tips Service ---
export const getSeasonalTips = async (): Promise<SeasonalTip[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('seasonal_tips').select('*').order('published_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(tip => ({ ...tip, images: tip.images || [] })) as SeasonalTip[];
};

export const addSeasonalTip = async (tipInput: SeasonalTipInput): Promise<SeasonalTip> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const processedImages: TipImage[] = [];
  if (tipInput.images && tipInput.images.length > 0) {
    for (const image of tipInput.images) {
      if (image.url && image.url.startsWith('data:image')) {
        const imagePath = `seasonal_tips/${Date.now()}_${tipInput.title.replace(/\s+/g, '_').substring(0, 20)}_${Math.random()}.png`;
        const uploadedUrl = await uploadBase64Image('seasonal-tips-images', imagePath, image.url);
        processedImages.push({ url: uploadedUrl, object_position_y: image.object_position_y || 50 });
      } else if (image.url) {
        processedImages.push(image);
      }
    }
  }

  const newTip: Omit<SeasonalTip, 'id' | 'created_at' | 'updated_at'> = {
    title: tipInput.title,
    description: tipInput.description,
    content_type: tipInput.content_type,
    source_url: tipInput.source_url,
    article_markdown_content: tipInput.article_markdown_content,
    images: processedImages,
    tags: tipInput.tags,
    author_name: tipInput.author_name,
    published_at: new Date().toISOString(), 
  };
  const { data, error } = await supabase.from('seasonal_tips').insert([newTip]).select().single();
  if (error) throw new Error(error.message);
  return { ...data, images: data.images || [] } as SeasonalTip;
};

export const updateSeasonalTip = async (tipId: string, updates: Partial<SeasonalTipInput>): Promise<SeasonalTip> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  let finalUpdates: Partial<SeasonalTipInput> = { ...updates }; 
  
  if (updates.images && Array.isArray(updates.images)) {
    const processedImages: TipImage[] = [];
    for (const image of updates.images) {
      if (image.url && image.url.startsWith('data:image')) {
        const imagePath = `seasonal_tips/${tipId}/${Date.now()}_${Math.random()}_cover.png`;
        const uploadedUrl = await uploadBase64Image('seasonal-tips-images', imagePath, image.url);
        processedImages.push({ url: uploadedUrl, object_position_y: image.object_position_y || 50 });
      } else if (image.url) {
        processedImages.push(image);
      }
    }
    finalUpdates.images = processedImages;
  }
  
  const { data, error } = await supabase
    .from('seasonal_tips')
    .update(finalUpdates as Partial<SeasonalTip>) 
    .eq('id', tipId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...data, images: data.images || [] } as SeasonalTip;
};


// --- User Profile Service ---
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) throw new Error("Could not verify user for profile fetch.");
  
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('preferences, updated_at')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') throw new Error(profileError.message); 

  const mergedProfile: UserProfile = {
    id: userId,
    full_name: user.user_metadata.full_name || null,
    avatar_url: user.user_metadata.avatar_url || null,
    preferences: profileData?.preferences || null,
    updated_at: profileData?.updated_at || user.updated_at,
  };

  return mergedProfile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { full_name, avatar_url, preferences } = updates;
  const authUpdates: { [key: string]: any } = {};
  let finalAvatarUrl = avatar_url;

  if (avatar_url && avatar_url.startsWith('data:image')) {
    const imagePath = `${userId}/avatar.png`;
    finalAvatarUrl = await uploadBase64Image('user-avatar', imagePath, avatar_url);
  }

  if (full_name !== undefined) authUpdates.full_name = full_name;
  if (finalAvatarUrl !== undefined) authUpdates.avatar_url = finalAvatarUrl;

  if (Object.keys(authUpdates).length > 0) {
    const { error: authUpdateError } = await supabase.auth.updateUser({ data: authUpdates });
    if (authUpdateError) throw new Error(`Auth update error: ${authUpdateError.message}`);
  }

  if (preferences !== undefined) {
    const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', userId)
        .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw new Error(`Fetch preferences error: ${fetchError.message}`);

    const mergedPreferences = deepMerge(existingProfile?.preferences || {}, preferences);
    
    const { error: profileUpdateError } = await supabase
      .from('user_profiles')
      .upsert([{ id: userId, preferences: mergedPreferences }], { onConflict: 'id' });

    if (profileUpdateError) throw new Error(`Profile update error: ${profileUpdateError.message}`);
  }

  const freshProfile = await getUserProfile(userId);
  if (!freshProfile) throw new Error("Failed to retrieve updated profile.");

  return freshProfile;
};


// --- Seeding ---
export const seedInitialData = async () => {
  if (!supabase) { console.warn("Supabase not init, skipping seed."); return; }

  const { count, error } = await supabase
    .from('flora_pedia')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error("Error checking for existing data, skipping seed:", error.message);
    return;
  }
  
  if (count !== null && count > 0) {
    return; // Data exists, do not seed.
  }
  
  console.log("Attempting to seed initial data...");
  for (const plantData of INITIAL_PLANTS_DATA_FOR_SEEDING) {
    try {
      await addPlant(plantData as Omit<Plant, 'id' | 'created_at' | 'updated_at'>); 
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) { 
        // This is a race condition fallback, but the head check should prevent it.
      } else {
        console.error(`Error seeding plant ${plantData.plant_identification_overview?.common_names?.[0]}:`, error);
      }
    }
  }
  // Seeding for other types can be re-enabled if needed
  console.log("Initial data seeding process completed.");
};

export function mapPlantToPlantListItemData(plant: Plant | FloraPediaTableRow): PlantListItemData {
  if ('data' in plant && typeof (plant as FloraPediaTableRow).data === 'object') { 
    const row = plant as FloraPediaTableRow;
    return {
      id: row.id,
      commonName: row.common_names?.[0] || 'Unknown Plant',
      scientificName: row.latin_name_scientific_name || 'N/A',
      imageUrl: (row.data as any)?.display_image_url || null,
      imagePosY: (row.data as any)?.image_object_position_y || 50,
      family: row.plant_family || null,
      typeCategory: row.plant_type_category || null,
      updatedAt: row.updated_at,
    };
  } else { 
    const p = plant as Plant;
    return {
      id: p.id,
      commonName: p.plant_identification_overview.common_names[0] || 'Unknown Plant',
      scientificName: p.plant_identification_overview.latin_name_scientific_name,
      imageUrl: p.display_image_url,
      imagePosY: p.image_object_position_y || 50,
      family: p.plant_identification_overview.plant_family,
      typeCategory: p.plant_identification_overview.plant_type_category,
      updatedAt: p.updated_at,
    };
  }
}

export function mapSeasonalTipToListItemData(tip: SeasonalTip): SeasonalTipListItemData {
  return {
    id: tip.id,
    title: tip.title,
    description: tip.description,
    imageUrl: tip.images?.[0]?.url || null,
    imagePosY: tip.images?.[0]?.object_position_y || 50,
    tags: tip.tags,
    publishedAt: tip.published_at || tip.created_at,
    updatedAt: tip.updated_at,
  };
}

export const getPestGuardians = async (): Promise<PestGuardian[]> => { console.warn("getPestGuardians not implemented"); return []; };
export const getGrowHowTechniques = async (): Promise<GrowHowTechnique[]> => { console.warn("getGrowHowTechniques not implemented"); return []; };
