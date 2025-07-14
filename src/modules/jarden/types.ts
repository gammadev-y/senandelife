











export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type PlantCalendarTaskType = 'SowIndoors' | 'SowOutdoors' | 'Transplant' | 'Prune' | 'Fertilize' | 'Harvest' | 'Maintenance' | 'Germinate' | 'FlowerWatch' | 'FruitWatch' | 'SeedCollect' | 'Other';
export type MonthAbbreviation = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

export interface PlantTask {
  taskType: PlantCalendarTaskType;
  description?: string;
}

export interface TextRange {
  min: number | null;
  max: number | null;
  text_range: string; 
}

export interface HardinessZones {
  usda: string | null; 
  rhs: string | null; 
  other_system_specify: string | null; 
}

// Parts of PlantIdentificationOverview that are NOT direct columns in flora_pedia
export interface PlantIdentificationOverviewData {
  parent_plant_link_encyclopedia_id: string | null; // Maps to parent_plant_id (direct column)
  expected_mature_height_meters: TextRange;
  expected_mature_spread_width_meters: TextRange;
  native_regions: string[];
  hardiness_zones: HardinessZones;
}

// Merged type for frontend use, combining direct DB columns and what's usually in JSONB
export interface PlantIdentificationOverview {
  common_names: string[];
  latin_name_scientific_name: string;
  plant_family: string;
  plant_type_category: string; 
  description_brief: string; 
  cultivar_variety: string | null;
  growth_structure_habit: string; 
  expected_mature_height_meters: TextRange;
  expected_mature_spread_width_meters: TextRange;
  life_cycle: string; 
  native_regions: string[];
  hardiness_zones: HardinessZones;
}


export interface ToxicityDetail {
  level: 'None' | 'Low' | 'Medium' | 'High' | 'Unknown';
  details: string | null; 
}

export interface ToxicityInformation {
  human_toxicity: ToxicityDetail;
  dog_toxicity: ToxicityDetail;
  cat_toxicity: ToxicityDetail;
  other_animal_toxicity_specify: string | null; 
}

export interface KeyFeaturesUsesGeneral {
  primary_uses: string[]; 
  special_distinguishing_features: string[]; 
  toxicity_information: ToxicityInformation;
}

export interface LightRequirementsGeneral {
  recommended_exposure: string; 
  minimum_daily_light_hours_mature: number | null;
  notes_on_light_mature: string | null;
}

export interface WaterRequirementsGeneral {
  recommended_watering_frequency_moisture_level: string; 
  drought_tolerance: 'High' | 'Medium' | 'Low' | 'None';
  watering_notes_min_max_guidance: string | null; 
}

export interface SoilPHRangeOverall {
  min: number; 
  max: number; 
  optimal: number; 
}

export interface SoilRequirementsGeneral {
  preferred_soil_types: string[]; 
  soil_ph_range_overall: SoilPHRangeOverall;
  soil_drainage_requirements: string; 
  soil_enrichment_notes: string | null; 
}

export interface AirTemperatureCelsius {
  daytime_optimal_min: number;
  daytime_optimal_max: number;
  nighttime_optimal_min: number;
  nighttime_optimal_max: number;
  absolute_survival_min: number;
  absolute_survival_max: number;
  notes: string; 
}

export interface RelativeHumidityPercentage {
  optimal_min: number;
  optimal_max: number;
  absolute_min: number;
  absolute_max: number;
  notes: string;
}

export interface LightIntensityLux {
  seedling_optimal_min: number | null;
  seedling_optimal_max: number | null;
  mature_plant_optimal_min: number | null;
  mature_plant_optimal_max: number | null;
  notes: string; 
}

export interface PlacementSpacing {
  best_placement_indoors: string | null;
  best_placement_outdoors: string | null;
  recommended_planting_spacing_meters: string | null; 
}

export interface EnvironmentalTolerancesDetailed {
  air_temperature_celsius: AirTemperatureCelsius;
  relative_humidity_percentage: RelativeHumidityPercentage;
  light_intensity_lux: LightIntensityLux;
  placement_spacing: PlacementSpacing;
}

export interface CultivationGrowingConditions {
  light_requirements_general: LightRequirementsGeneral;
  water_requirements_general: WaterRequirementsGeneral;
  soil_requirements_general: SoilRequirementsGeneral;
  environmental_tolerances_detailed: EnvironmentalTolerancesDetailed;
}

export interface PhaseSpecificFertilization {
  growth_phase: string; 
  nutrient_focus: string | null; 
  recommended_fertilizer_types_or_ids: string[]; 
  natural_options_for_phase: string[]; 
  application_notes: string | null; 
}

export interface PlantNutritionFertilizationNeeds {
  general_fertilizer_preferences: string | null; 
  phase_specific_fertilization_needs: PhaseSpecificFertilization[];
}

export interface PruningShaping {
  pruning_objectives: string[]; 
  best_times_for_pruning_seasonal: string[]; 
  pruning_techniques_description: string | null;
  tools_recommended: string[];
  pruning_notes_detailed: string | null; 
}

export interface RepottingForContainerPlants {
  repotting_frequency_indicators: string | null;
  best_time_for_repotting: string | null;
  repotting_instructions: string | null;
}

export interface PreGerminationTreatment {
  soaking_seeds_details: string | null; 
  scarification_details: string | null; 
  stratification_details: string | null; 
}

export interface SeedDepthCm {
  min: number;
  max: number;
  notes: string | null;
}

export interface SoilTemperatureCelsius {
  optimal_min: number;
  optimal_max: number;
  absolute_min_for_germination: number;
  absolute_max_for_germination: number;
  notes: string | null; 
}

export interface HumidityPercentageGermination {
  optimal_min: number;
  optimal_max: number;
}

export interface GerminationRequirementsDetailed {
  seed_depth_cm: SeedDepthCm;
  soil_temperature_celsius: SoilTemperatureCelsius;
  soil_mix_recommendation: string; 
  soil_moisture_level_description: string; 
  watering_method_germination: string; 
  humidity_percentage_germination: HumidityPercentageGermination;
  light_for_germination_requirement: string; 
  expected_germination_timeframe_days_range: string | null; 
}

export interface EarlySeedlingPhaseWaterManagement {
  target_medium_moisture_level_description: string | null;
  recommended_watering_method: string[]; 
  watering_frequency_guidance: string | null;
  approximate_amount_of_water_per_application: string | null;
  importance_of_good_drainage_notes: string | null;
  water_temperature_consideration_celsius: string | null;
  soil_temperature_considerations_after_watering: string | null;
  humidity_considerations_acclimation: string | null;
  signs_of_overwatering_seedlings: string[];
  signs_of_underwatering_seedlings: string[];
  transitioning_watering_practices_notes: string | null;
}

export interface TemperatureRequirementsSeedlingsCelsius {
  day_min: number | null;
  day_max: number | null;
  night_min: number | null;
  night_max: number | null;
}

export interface OtherEarlySeedlingCare {
  light_requirements_for_seedlings_hours_type: string | null; 
  temperature_requirements_for_seedlings_celsius: TemperatureRequirementsSeedlingsCelsius;
  ventilation_needs_description: string | null;
  first_fertilization_details: string | null; 
  hardening_off_procedure_within_8_weeks: string | null; 
}

export interface SeedPropagationDetails {
  is_applicable: boolean;
  brief_sowing_and_early_care_steps: string[];
  expected_success_rate_notes: string | null; 
  recommended_sowing_time_season: string | null; 
  pre_germination_treatment: PreGerminationTreatment;
  germination_requirements_detailed: GerminationRequirementsDetailed;
  early_seedling_phase_water_management_sprout_to_8_weeks: EarlySeedlingPhaseWaterManagement;
  other_early_seedling_care_sprout_to_8_weeks: OtherEarlySeedlingCare;
}

export interface CuttingTiming {
  type: string; 
  timing_season: string; 
}

export interface CuttingPropagationDetails {
  is_applicable: boolean;
  cutting_types_common: string[]; 
  best_time_for_cuttings_by_type: CuttingTiming[];
  brief_step_by_step_overview: string[];
  cutting_preparation_notes: string | null; 
  rooting_medium_recommendations: string[]; 
  environmental_conditions_for_rooting_notes: string | null; 
  expected_rooting_timeframe_weeks_range: string | null; 
  aftercare_once_rooted_instructions: string | null; 
  expected_success_rate_notes: string | null;
  common_challenges: string[];
}

export interface GraftingTiming {
  type: string; 
  timing_season: string; 
}

export interface GraftingPropagationDetails {
  is_applicable: boolean;
  common_grafting_types_used: string[]; 
  best_time_for_grafting_by_type: GraftingTiming[];
  brief_step_by_step_overview: string[];
  rootstock_selection_considerations: string | null;
  scion_selection_considerations: string | null;
  tools_materials_needed: string[];
  aftercare_instructions_detailed: string | null;
  expected_success_rate_notes: string | null;
  common_challenges: string[];
}

export interface PropagationMethodsSummary {
  primary_methods: string[]; 
  seed_propagation_details: SeedPropagationDetails;
  cutting_propagation_details: CuttingPropagationDetails;
  grafting_propagation_details: GraftingPropagationDetails;
}

export interface PlantCareMaintenance {
  pruning_shaping: PruningShaping;
  repotting_for_container_plants: RepottingForContainerPlants | null; 
  root_strengthening_techniques: string[];
  propagation_methods_summary: PropagationMethodsSummary;
}

export interface GrowthStageTimelineEntry {
  expected_min_days: number;
  expected_max_days: number;
  optimal_average_days: number;
  event_description_notes: string; 
}

export interface GrowthStageTimelineFirstRepotting extends GrowthStageTimelineEntry {
    pot_size_increase_factor_guideline: number | null; 
}
export interface GrowthStageTimelineFirstFertilization extends GrowthStageTimelineEntry {
    trigger_condition: string; 
}

export interface GrowthStageTimelinesDaysFromSowing {
  sprouting: GrowthStageTimelineEntry;
  first_true_leaves: GrowthStageTimelineEntry;
  first_repotting_seedling: GrowthStageTimelineFirstRepotting;
  hardening_off_start: GrowthStageTimelineEntry;
  transplant_outdoors_seedling: GrowthStageTimelineEntry;
  first_fertilization_after_true_leaves: GrowthStageTimelineFirstFertilization; 
  first_pruning_formative: GrowthStageTimelineEntry;
  flowering_start: GrowthStageTimelineEntry;
  first_harvest_expected: GrowthStageTimelineEntry;
}

export interface PestInteractionItem {
  pest_name: string;
  notes: string | null;
}

export interface PestInteractions {
  pests_attracted_to_plant: PestInteractionItem[];
  pests_repelled_by_plant: PestInteractionItem[];
}

export interface DiseaseSusceptibilityItem {
  disease_name: string;
  symptoms_notes: string | null;
}

export interface DiseaseSusceptibility {
  common_diseases: DiseaseSusceptibilityItem[];
  prevention_non_chemical_treatment_notes: string | null;
}

export interface PestDiseaseManagementSpecificStrategies {
  natural_organic_pest_control_methods: string[];
  chemical_pest_control_options_if_necessary: string[]; 
  integrated_pest_management_ipm_strategies_for_plant: string | null;
}

export interface CompanionPlantingItem {
  plant_name_or_id: string; 
  benefit_provided?: string; 
  benefit_received?: string; 
  reason?: string;          
}

export interface CompanionPlanting {
  beneficial_companions_plants_it_aids: CompanionPlantingItem[];
  synergistic_companions_plants_that_aid_it: CompanionPlantingItem[];
  antagonistic_plants_avoid_nearby: CompanionPlantingItem[];
}

export interface PollinatorsWildlifeInteraction {
  attracts_pollinators: string[]; 
  provides_food_shelter_for_wildlife: string[]; 
}

export interface EcologicalInteractions {
  pest_interactions: PestInteractions;
  disease_susceptibility: DiseaseSusceptibility;
  pest_disease_management_specific_strategies: PestDiseaseManagementSpecificStrategies;
  companion_planting: CompanionPlanting;
  pollinators_wildlife_interaction: PollinatorsWildlifeInteraction;
}

export interface FloweringPollinationForFruitSet {
  flowering_time_season: string | null;
  pollination_requirements: string | null; 
  cross_pollination_partners_if_applicable_ids_names: string[];
  techniques_to_assist_pollination: string | null;
}

export interface FruitVegetableDevelopmentEnhancement {
  time_from_flower_to_harvest_typical: string | null; 
  techniques_to_improve_size: string | null;
  techniques_to_improve_flavor: string | null;
  techniques_to_improve_texture: string | null;
  techniques_to_improve_juice_content: string | null;
}

export interface HarvestingDetails {
  harvesting_season_indicators_of_ripeness: string | null;
  harvesting_techniques: string | null;
  post_harvest_handling_storage_short_term: string | null;
}

export interface FruitingHarvestingConditional {
  is_applicable: boolean;
  flowering_pollination_for_fruit_set: FloweringPollinationForFruitSet;
  fruit_vegetable_development_enhancement: FruitVegetableDevelopmentEnhancement;
  harvesting_details: HarvestingDetails;
}

export interface AnnualCareCalendarTimelineSummaryItem {
  task_event: string; // This could be PlantCalendarTaskType or more descriptive
  target_timing_seasons_months: string[];
  brief_notes: string | null;
}

export interface CulinaryUseItem {
  part_used: string; 
  preparation_methods: string[]; 
  common_dishes_recipes_ideas: string[];
  flavor_profile_texture: string | null;
}

export interface PreservationConservationTechnique {
  method_name: string; 
  suitability_for_this_plant_part: string; 
  detailed_instructions_recipe_link_or_text: string | null; 
  expected_storage_life_and_conditions: string | null;
}

export interface AlternativeProductUseItem {
  product_name: string; 
  parts_of_plant_used: string[];
  preparation_extraction_method: string | null;
  traditional_modern_use_cases: string | null;
  notes_cautions: string | null;
}

export interface MedicinalUseItem {
  part_used: string;
  ailment_treated_traditional_use: string;
  preparation_dosage_traditional: string | null;
  scientific_evidence_notes: string | null; 
  important_cautions_disclaimer: string; 
}

export interface UseCasesHumanSymbiosis {
  culinary_uses: CulinaryUseItem[];
  preservation_conservation_techniques_for_plant: PreservationConservationTechnique[];
  alternative_products_uses: AlternativeProductUseItem[];
  medicinal_uses_traditional_folk: MedicinalUseItem[]; 
  other_craft_material_uses: string[]; 
}

export interface SeedSavingHarvestingGuide {
  timing_indicators: string | null;
  method_selection_criteria: string | null;
}

export interface OptimalSeedStorageConditions {
  temperature_celsius: string | null; 
  humidity_percent: string | null; 
  container_type: string | null; 
  other_notes: string | null; 
}

export interface SeedSavingStorageDetails {
  seed_viability_duration_years_optimal: string | null; 
  harvesting_seeds_guide: SeedSavingHarvestingGuide;
  cleaning_drying_seeds_techniques: string | null;
  optimal_storage_conditions: OptimalSeedStorageConditions;
  seed_viability_testing_methods_description: string[]; 
}

export interface InformationSourceItem {
  source_type: string; 
  details_reference: string;
}

export interface AIQueryLog {
  query_prompt: string | null;
  ai_model_used: string | null;
  response_summary_or_id: string | null;
  confidence_in_ai_data: string | null; 
}

export interface UserSourcingInformation {
  user_notes: string | null;
  date_record_created: string; 
  date_record_last_modified: string; 
  information_sources: InformationSourceItem[];
  ai_query_log_if_applicable: AIQueryLog | null;
}

// Main Plant Interface (Frontend Model)
// Cleaned up to remove redundant top-level properties.
// The single source of truth for identification fields is now 'plant_identification_overview'.
export interface Plant {
  id: string; 
  parent_plant_id?: string | null; // This is a direct column, so it stays.
  display_image_url: string | null;
  image_object_position_y?: number; // 0-100, default 50
  
  plant_identification_overview: PlantIdentificationOverview; 
  key_features_uses_general: KeyFeaturesUsesGeneral;
  cultivation_growing_conditions: CultivationGrowingConditions;
  plant_nutrition_fertilization_needs: PlantNutritionFertilizationNeeds;
  plant_care_maintenance: PlantCareMaintenance;
  growth_stage_timelines_days_from_sowing: GrowthStageTimelinesDaysFromSowing;
  ecological_interactions: EcologicalInteractions;
  fruiting_harvesting_conditional: FruitingHarvestingConditional;
  annual_care_calendar_timeline_summary: AnnualCareCalendarTimelineSummaryItem[];
  use_cases_human_symbiosis: UseCasesHumanSymbiosis;
  seed_saving_storage_details: SeedSavingStorageDetails;
  user_sourcing_information: UserSourcingInformation;
  created_at: string;
  updated_at: string;
}

// Represents the data stored in the 'data' JSONB column of the flora_pedia table.
export interface PlantJsonData {
  [key: string]: any; // To ensure compatibility with Supabase Json type
  display_image_url: string | null;
  image_object_position_y?: number;
  plant_identification_overview: PlantIdentificationOverview;
  key_features_uses_general: KeyFeaturesUsesGeneral;
  cultivation_growing_conditions: CultivationGrowingConditions;
  plant_nutrition_fertilization_needs: PlantNutritionFertilizationNeeds;
  plant_care_maintenance: PlantCareMaintenance;
  growth_stage_timelines_days_from_sowing: GrowthStageTimelinesDaysFromSowing;
  ecological_interactions: EcologicalInteractions;
  fruiting_harvesting_conditional: FruitingHarvestingConditional;
  annual_care_calendar_timeline_summary: AnnualCareCalendarTimelineSummaryItem[];
  use_cases_human_symbiosis: UseCasesHumanSymbiosis;
  seed_saving_storage_details: SeedSavingStorageDetails;
  user_sourcing_information: UserSourcingInformation;
}

// Raw data from AI, likely partial and needs validation/defaulting
export type RawPlantDataFromAI = Partial<Plant>;

// Key for AI to fill specific plant sections
export type PlantSectionKeyForAI =
  | 'plant_identification_overview'
  | 'key_features_uses_general'
  | 'cultivation_growing_conditions'
  | 'plant_nutrition_fertilization_needs'
  | 'plant_care_maintenance'
  | 'growth_stage_timelines_days_from_sowing'
  | 'ecological_interactions'
  | 'fruiting_harvesting_conditional'
  | 'annual_care_calendar_timeline_summary'
  | 'use_cases_human_symbiosis'
  | 'seed_saving_storage_details';

// Raw section data from AI
export type RawPlantSectionDataFromAI<K extends PlantSectionKeyForAI> = Pick<RawPlantDataFromAI, K>;

export interface PlantInput {
    common_name: string;
    scientific_name?: string;
    family?: string;
    plant_type_category?: string;
    description_brief?: string;
    display_image_url?: string | null; // Can be base64 or null
    image_object_position_y?: number;
}

// FloraPediaTableRow (for Supabase mapping)
export interface FloraPediaTableRow {
  id: string;
  latin_name_scientific_name: string;
  common_names: string[];
  plant_family: string | null;
  plant_type_category: string | null;
  description_brief: string | null;
  cultivar_variety: string | null;
  parent_plant_id: string | null;
  growth_structure_habit: string | null;
  life_cycle: string | null;
  data: Json;
  created_at: string;
  updated_at: string;
}

// NutriBase (Fertilizers)
export interface FertilizerData {
  [key: string]: any; // To ensure compatibility with Supabase Json type
  imageUrl?: string | null;
  image_object_position_y?: number;
  description: string;
  primaryUses: string;
  ingredients: string;
  npkRatio?: string; // e.g., "10-10-10"
  secondaryMicronutrients?: string;
  phImpact?: string; // e.g., "Acidic", "Neutral", "Alkaline"
  electricalConductivity?: string; // EC value
  applicationMethods: string;
  applicationFrequency?: string;
  dilutionRate?: string;
  releaseProfile: string; // e.g., "Slow", "Fast", "Controlled"
  targetPlants?: string;
  bestPlantStages?: string;
  storageRequirements: string;
  shelfLife?: string;
  safetyPrecautions: string;
  compatibilityNotes?: string;
  userNotes?: string;
  informationSources?: string;
}

export interface Fertilizer {
  id: string;
  fertilizer_name: string;
  fertilizer_id_sku?: string; // Optional SKU or internal ID
  type: 'Organic' | 'Synthetic' | 'Mineral' | 'Soil Amendment' | 'Other';
  form: 'Liquid' | 'Granular' | 'Powder' | 'Spike' | 'Meal' | 'Tea' | 'Other';
  data: FertilizerData; // Stored as JSONB in Supabase
  created_at: string;
  updated_at: string;
}
export interface FertilizerInput {
  name: string;
  type?: Fertilizer['type'];
  form?: Fertilizer['form'];
  description?: string;
  imageUrl?: string | null; // base64 or null
  image_object_position_y?: number;
}


// CompostCorner (Composting Methods)
export interface CompostingMethodData {
  [key: string]: any; // To ensure compatibility with Supabase Json type
  imageUrl?: string | null;
  image_object_position_y?: number;
  description: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  timeToMature: string; // e.g., "2-6 months"
  systemDesignSetup: string;
  inputMaterialsGreen: string; // Nitrogen-rich
  inputMaterialsBrown: string; // Carbon-rich
  optimalCNRatio?: string; // e.g., "25:1 to 30:1"
  materialsToStrictlyAvoid: string;
  processManagement: string; // Turning, moisture, aeration
  leachateManagement?: string;
  troubleshootingCommonIssues: string;
  finishedCompostCharacteristics: string;
  harvestingAndUsingCompost: string;
  methodSpecifics?: string; // For unique aspects like Bokashi fermentation
  environmentalBenefits: string;
  userNotes?: string;
  informationSources?: string;
}

export interface CompostingMethod {
  id: string;
  method_name: string;
  composting_method_id?: string; // Optional internal ID
  primary_composting_approach: 'Aerobic (Hot Pile)' | 'Aerobic (Cold Pile)' | 'Aerobic (Tumbler)' | 'Anaerobic (Bokashi)' | 'Vermicomposting (Worm Farm)' | 'Sheet Mulching (Lasagna)' | 'Trench Composting' | 'Other';
  scale_of_operation: 'Small (Apartment/Balcony)' | 'Medium (Home Garden)' | 'Large (Homestead/Farm)' | 'Community Scale';
  produced_fertilizer_id?: string; // Link to NutriBase if it produces a specific fertilizer
  data: CompostingMethodData; // Stored as JSONB in Supabase
  created_at: string;
  updated_at: string;
}
export interface CompostingMethodInput {
  name: string;
  approach?: CompostingMethod['primary_composting_approach'];
  description?: string;
  imageUrl?: string | null; // base64 or null
  image_object_position_y?: number;
}


// GrowingGrounds
export type PlantStage = 'Planning' | 'Seeded' | 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Dormant' | 'Harvested' | 'Failed' | 'Removed';

export interface GrowingGroundPlant {
  plantId: string; // FK to FloraPedia.id
  quantity: number;
  datePlanted: string; // YYYY-MM-DD
  stageLog: { stage: PlantStage; date: string; }[];
  notes?: string;
}

export type GroundLogActionType = 
  | 'Planting' | 'Water' | 'Fertilize' | 'Prune' | 'Trim' | 'Weeding' | 'Mulching' | 'Maintenance'
  | 'Pest Control' | 'Disease Management' | 'Soil Amendment'
  | 'Harvest' | 'Observation' | 'Other' | 'Stage Update' | 'Inspection' | 'Intervention';

export interface GroundLogEntry {
  id: string; // UUID generated client-side or by DB
  timestamp: string; // ISO string
  actionType: GroundLogActionType;
  description: string;
  relatedPlantIds?: string[]; // Optional FKs to GrowingGroundPlant instances (could be plantId from FloraPedia)
  photoUrls?: string[];
  notes?: string;
}


// This interface represents the 'data' JSONB column for growing_grounds
export interface GrowingGroundData {
  [key: string]: any; // To ensure compatibility with Supabase Json type
  description: string;
  type: 'Raised Bed' | 'Ground Bed' | 'Pot' | 'Container' | 'Vertical Garden' | 'Greenhouse Bed' | 'Hydroponics' | 'Aquaponics' | 'Other';
  imageUrl?: string | null;
  image_object_position_y?: number;
  lightHoursMorning: number; // Average direct sun hours
  lightHoursAfternoon: number; // Average direct sun hours
  soilType: 'Clay' | 'Sandy' | 'Silty' | 'Peaty' | 'Chalky' | 'Loamy' | 'Custom Mix' | 'Other';
  customSoilDescription?: string;
  areaDimensions?: string; // e.g., "2m x 4m", "5-gallon pot"
  plants: GrowingGroundPlant[];
  logs: GroundLogEntry[];
  customNotes?: string;
  informationSources?: string; // e.g., links to soil tests, plans
}

// This is the main GrowingGround type for frontend use
export interface GrowingGround extends GrowingGroundData {
  id: string; // UUID
  name: string; // User-defined name for the ground
  created_at: string;
  updated_at: string;
}

export interface GrowingGroundInput {
  name: string;
  type?: GrowingGround['type'];
  description?: string;
  imageUrl?: string | null; // base64 or null
  image_object_position_y?: number;
}

// Seasonal Tips
export type SeasonalTipContentType = 'url' | 'article';

export interface TipImage {
  [key: string]: any; // To ensure compatibility with Supabase Json type
  url: string;
  object_position_y?: number;
}

export interface SeasonalTip {
  id: string;
  title: string;
  description?: string;
  content_type: SeasonalTipContentType;
  source_url?: string | null; // For 'url' type
  article_markdown_content?: string | null; // For 'article' type
  images: TipImage[];
  tags?: string[];
  author_name?: string;
  published_at?: string; // ISO string
  created_at: string;
  updated_at: string;
}

export interface SeasonalTipInput {
  title: string;
  description?: string;
  content_type: SeasonalTipContentType;
  source_url?: string | null;
  article_markdown_content?: string | null;
  images: TipImage[]; // Can contain base64 strings or existing URLs
  tags?: string[];
  author_name?: string;
}


// Generic types for App state and modals
export type ActiveModuleType = 'florapedia' | 'nutribase' | 'compostcorner' | 'growinggrounds' | 'calendar' | 'seasonaltips' | 'pestguardians' | 'growhowcentral';

export interface CustomAiPromptModalData {
  plantId: string;
  plantName: string;
  sectionKey?: PlantSectionKeyForAI;
}

export interface EventType {
    id: string;
    name: string;
    icon_name: string;
    color_code: string | null;
    description: string | null;
}

export interface CalendarEvent {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    start_date: string; // ISO string
    end_date: string | null; // ISO string
    event_type_id: string | null;
    is_recurring: boolean | null;
    recurrence_rule: string | null;
    is_completed: boolean;
    related_module: string | null;
    related_entry_id: string | null;
    created_at: string;
    updated_at: string;
    // Joined data from event_types for easier rendering
    event_types?: EventType;
}

// ViewModel for UI display
export interface CalendarEventViewModel extends CalendarEvent {
  ground_ids?: string[];
  // For easier UI access
  status: 'Pending' | 'Completed' | 'Overdue';
  color?: string; // from event_types.color_code
  iconName?: string; // from event_types.icon_name
}


// For User View History
export type ItemTypeForRecentView = 'plant' | 'fertilizer' | 'compost_method' | 'growing_ground' | 'seasonal_tip';

export interface RecentViewItem {
  id: string; // UUID of the history record itself
  item_id: string; // ID of the viewed item (plant, fertilizer, etc.)
  item_type: ItemTypeForRecentView;
  item_name: string;
  item_image_url: string | null;
  item_module_id: ActiveModuleType; // The module to navigate to
  viewed_at: string; // ISO string
}

// Placeholder types for future modules if needed by supabaseService
export interface PestGuardian { id: string; name: string; [key: string]: any; }
export interface GrowHowTechnique { id: string; name: string; [key: string]: any; }

// Weather types
export interface DailyForecast {
  date: string; // YYYY-MM-DD
  minTemp: number;
  maxTemp: number;
  weatherCode: number;
  minHumidity?: number; // Optional: daily minimum humidity
  maxHumidity?: number; // Optional: daily maximum humidity
}

export interface WeatherForecastData {
  current?: { 
    temperature: number;
    humidity: number;
    weatherCode: number;
  };
  daily: DailyForecast[];
}

export interface WeatherCodeMapping {
  description: string;
  iconName: string; // String key to map to a Heroicon component
}

// For weather location search results (Open-Meteo Geocoding API)
export interface SearchedLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  country?: string;
  admin1?: string; // State, region
  admin2?: string; // County, district
  admin3?: string; // Further subdivision
  timezone?: string;
}

// User's preference for weather location
export type WeatherLocationPreferenceType = 'geolocation' | 'manual' | 'disabled';

export interface WeatherLocationPreference {
  type: WeatherLocationPreferenceType;
  location?: SearchedLocation; // Only present if type is 'manual'
}

// User Profile
export type ThemeSetting = 'light' | 'dark' | 'system';

export interface UserPreferences {
  [key: string]: any; // To ensure compatibility with Supabase Json type
  theme?: ThemeSetting;
  weather?: WeatherLocationPreference | null;
  // Add other preferences here as needed
}

export interface UserProfile {
  id: string; // Corresponds to Supabase auth.users.id
  full_name?: string | null;
  avatar_url?: string | null;
  preferences?: UserPreferences;
  updated_at?: string; // ISO string
}