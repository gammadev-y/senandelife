


import { ai, geminiModel } from '../../../../services/gemini';
import { Plant, PlantSectionKeyForAI, RawPlantDataFromAI, EventType } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const getModel = () => {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. Check API_KEY.");
  }
  return ai;
};

// --- START: Full Plant Schema Definition for Gemini ---

const textRangeSchema = { type: Type.OBJECT, properties: { min: { type: Type.NUMBER, nullable: true }, max: { type: Type.NUMBER, nullable: true }, text_range: { type: Type.STRING }}};
const hardinessZonesSchema = { type: Type.OBJECT, properties: { usda: { type: Type.STRING, nullable: true }, rhs: { type: Type.STRING, nullable: true }, other_system_specify: { type: Type.STRING, nullable: true }}};
const toxicityDetailSchema = { type: Type.OBJECT, properties: { level: { type: Type.STRING, enum: ['None', 'Low', 'Medium', 'High', 'Unknown'] }, details: { type: Type.STRING, nullable: true }}};

const plantIdentificationOverviewSchema = {
    type: Type.OBJECT,
    properties: {
        common_names: { type: Type.ARRAY, items: { type: Type.STRING } },
        latin_name_scientific_name: { type: Type.STRING },
        plant_family: { type: Type.STRING },
        plant_type_category: { type: Type.STRING },
        description_brief: { type: Type.STRING },
        cultivar_variety: { type: Type.STRING, nullable: true },
        growth_structure_habit: { type: Type.STRING },
        expected_mature_height_meters: textRangeSchema,
        expected_mature_spread_width_meters: textRangeSchema,
        life_cycle: { type: Type.STRING },
        native_regions: { type: Type.ARRAY, items: { type: Type.STRING } },
        hardiness_zones: hardinessZonesSchema,
    }
};

const keyFeaturesUsesGeneralSchema = {
    type: Type.OBJECT,
    properties: {
        primary_uses: { type: Type.ARRAY, items: { type: Type.STRING } },
        special_distinguishing_features: { type: Type.ARRAY, items: { type: Type.STRING } },
        toxicity_information: { type: Type.OBJECT, properties: {
            human_toxicity: toxicityDetailSchema,
            dog_toxicity: toxicityDetailSchema,
            cat_toxicity: toxicityDetailSchema,
            other_animal_toxicity_specify: { type: Type.STRING, nullable: true },
        }},
    }
};

const cultivationGrowingConditionsSchema = {
    type: Type.OBJECT,
    properties: {
        light_requirements_general: { type: Type.OBJECT, properties: {
            recommended_exposure: { type: Type.STRING },
            minimum_daily_light_hours_mature: { type: Type.NUMBER, nullable: true },
            notes_on_light_mature: { type: Type.STRING, nullable: true },
        }},
        water_requirements_general: { type: Type.OBJECT, properties: {
            recommended_watering_frequency_moisture_level: { type: Type.STRING },
            drought_tolerance: { type: Type.STRING, enum: ['High', 'Medium', 'Low', 'None'] },
            watering_notes_min_max_guidance: { type: Type.STRING, nullable: true },
        }},
        soil_requirements_general: { type: Type.OBJECT, properties: {
            preferred_soil_types: { type: Type.ARRAY, items: { type: Type.STRING } },
            soil_ph_range_overall: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER }, optimal: { type: Type.NUMBER } }},
            soil_drainage_requirements: { type: Type.STRING },
            soil_enrichment_notes: { type: Type.STRING, nullable: true },
        }},
        environmental_tolerances_detailed: { type: Type.OBJECT, properties: {
            air_temperature_celsius: { type: Type.OBJECT, properties: { daytime_optimal_min: { type: Type.NUMBER }, daytime_optimal_max: { type: Type.NUMBER }, nighttime_optimal_min: { type: Type.NUMBER }, nighttime_optimal_max: { type: Type.NUMBER }, absolute_survival_min: { type: Type.NUMBER }, absolute_survival_max: { type: Type.NUMBER }, notes: { type: Type.STRING } }},
            relative_humidity_percentage: { type: Type.OBJECT, properties: { optimal_min: { type: Type.NUMBER }, optimal_max: { type: Type.NUMBER }, absolute_min: { type: Type.NUMBER }, absolute_max: { type: Type.NUMBER }, notes: { type: Type.STRING } }},
            light_intensity_lux: { type: Type.OBJECT, properties: { seedling_optimal_min: { type: Type.NUMBER, nullable: true }, seedling_optimal_max: { type: Type.NUMBER, nullable: true }, mature_plant_optimal_min: { type: Type.NUMBER, nullable: true }, mature_plant_optimal_max: { type: Type.NUMBER, nullable: true }, notes: { type: Type.STRING } }},
            placement_spacing: { type: Type.OBJECT, properties: { best_placement_indoors: { type: Type.STRING, nullable: true }, best_placement_outdoors: { type: Type.STRING, nullable: true }, recommended_planting_spacing_meters: { type: Type.STRING, nullable: true } }},
        }},
    }
};

const plantNutritionFertilizationNeedsSchema = {
    type: Type.OBJECT,
    properties: {
        general_fertilizer_preferences: { type: Type.STRING, nullable: true },
        phase_specific_fertilization_needs: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    growth_phase: { type: Type.STRING },
                    nutrient_focus: { type: Type.STRING, nullable: true },
                    recommended_fertilizer_types_or_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
                    natural_options_for_phase: { type: Type.ARRAY, items: { type: Type.STRING } },
                    application_notes: { type: Type.STRING, nullable: true },
                }
            }
        },
    }
};

const growthStageTimelineEntrySchema = { type: Type.OBJECT, properties: { expected_min_days: { type: Type.NUMBER }, expected_max_days: { type: Type.NUMBER }, optimal_average_days: { type: Type.NUMBER }, event_description_notes: { type: Type.STRING } } };
const growthStageTimelinesDaysFromSowingSchema = { type: Type.OBJECT, properties: { sprouting: growthStageTimelineEntrySchema, first_true_leaves: growthStageTimelineEntrySchema, first_repotting_seedling: { ...growthStageTimelineEntrySchema, properties: { ...growthStageTimelineEntrySchema.properties, pot_size_increase_factor_guideline: { type: Type.NUMBER, nullable: true } } }, hardening_off_start: growthStageTimelineEntrySchema, transplant_outdoors_seedling: growthStageTimelineEntrySchema, first_fertilization_after_true_leaves: { ...growthStageTimelineEntrySchema, properties: { ...growthStageTimelineEntrySchema.properties, trigger_condition: { type: Type.STRING } } }, first_pruning_formative: growthStageTimelineEntrySchema, flowering_start: growthStageTimelineEntrySchema, first_harvest_expected: growthStageTimelineEntrySchema } };
const pestInteractionItemSchema = { type: Type.OBJECT, properties: { pest_name: { type: Type.STRING }, notes: { type: Type.STRING, nullable: true }}};
const diseaseSusceptibilityItemSchema = { type: Type.OBJECT, properties: { disease_name: { type: Type.STRING }, symptoms_notes: { type: Type.STRING, nullable: true }}};
const companionPlantingItemSchema = { type: Type.OBJECT, properties: { plant_name_or_id: { type: Type.STRING }, benefit_provided: { type: Type.STRING, nullable: true }, benefit_received: { type: Type.STRING, nullable: true }, reason: { type: Type.STRING, nullable: true }}};
const ecologicalInteractionsSchema = { type: Type.OBJECT, properties: { pest_interactions: { type: Type.OBJECT, properties: { pests_attracted_to_plant: { type: Type.ARRAY, items: pestInteractionItemSchema }, pests_repelled_by_plant: { type: Type.ARRAY, items: pestInteractionItemSchema } } }, disease_susceptibility: { type: Type.OBJECT, properties: { common_diseases: { type: Type.ARRAY, items: diseaseSusceptibilityItemSchema }, prevention_non_chemical_treatment_notes: { type: Type.STRING, nullable: true } } }, pest_disease_management_specific_strategies: { type: Type.OBJECT, properties: { natural_organic_pest_control_methods: { type: Type.ARRAY, items: { type: Type.STRING } }, chemical_pest_control_options_if_necessary: { type: Type.ARRAY, items: { type: Type.STRING } }, integrated_pest_management_ipm_strategies_for_plant: { type: Type.STRING, nullable: true } } }, companion_planting: { type: Type.OBJECT, properties: { beneficial_companions_plants_it_aids: { type: Type.ARRAY, items: companionPlantingItemSchema }, synergistic_companions_plants_that_aid_it: { type: Type.ARRAY, items: companionPlantingItemSchema }, antagonistic_plants_avoid_nearby: { type: Type.ARRAY, items: companionPlantingItemSchema } } }, pollinators_wildlife_interaction: { type: Type.OBJECT, properties: { attracts_pollinators: { type: Type.ARRAY, items: { type: Type.STRING } }, provides_food_shelter_for_wildlife: { type: Type.ARRAY, items: { type: Type.STRING } } } } } };
const fruitingHarvestingConditionalSchema = { type: Type.OBJECT, properties: { is_applicable: { type: Type.BOOLEAN }, flowering_pollination_for_fruit_set: { type: Type.OBJECT, properties: { flowering_time_season: { type: Type.STRING, nullable: true }, pollination_requirements: { type: Type.STRING, nullable: true }, cross_pollination_partners_if_applicable_ids_names: { type: Type.ARRAY, items: { type: Type.STRING } }, techniques_to_assist_pollination: { type: Type.STRING, nullable: true } } }, fruit_vegetable_development_enhancement: { type: Type.OBJECT, properties: { time_from_flower_to_harvest_typical: { type: Type.STRING, nullable: true }, techniques_to_improve_size: { type: Type.STRING, nullable: true }, techniques_to_improve_flavor: { type: Type.STRING, nullable: true }, techniques_to_improve_texture: { type: Type.STRING, nullable: true }, techniques_to_improve_juice_content: { type: Type.STRING, nullable: true } } }, harvesting_details: { type: Type.OBJECT, properties: { harvesting_season_indicators_of_ripeness: { type: Type.STRING, nullable: true }, harvesting_techniques: { type: Type.STRING, nullable: true }, post_harvest_handling_storage_short_term: { type: Type.STRING, nullable: true } } } } };
const annualCareCalendarTimelineSummarySchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { task_event: { type: Type.STRING }, target_timing_seasons_months: { type: Type.ARRAY, items: { type: Type.STRING } }, brief_notes: { type: Type.STRING, nullable: true } } } };
const culinaryUseItemSchema = { type: Type.OBJECT, properties: { part_used: { type: Type.STRING }, preparation_methods: { type: Type.ARRAY, items: { type: Type.STRING } }, common_dishes_recipes_ideas: { type: Type.ARRAY, items: { type: Type.STRING } }, flavor_profile_texture: { type: Type.STRING, nullable: true }}};
const preservationTechniqueSchema = { type: Type.OBJECT, properties: { method_name: { type: Type.STRING }, suitability_for_this_plant_part: { type: Type.STRING }, detailed_instructions_recipe_link_or_text: { type: Type.STRING, nullable: true }, expected_storage_life_and_conditions: { type: Type.STRING, nullable: true }}};
const alternativeProductUseItemSchema = { type: Type.OBJECT, properties: { product_name: { type: Type.STRING }, parts_of_plant_used: { type: Type.ARRAY, items: { type: Type.STRING } }, preparation_extraction_method: { type: Type.STRING, nullable: true }, traditional_modern_use_cases: { type: Type.STRING, nullable: true }, notes_cautions: { type: Type.STRING, nullable: true }}};
const medicinalUseItemSchema = { type: Type.OBJECT, properties: { part_used: { type: Type.STRING }, ailment_treated_traditional_use: { type: Type.STRING }, preparation_dosage_traditional: { type: Type.STRING, nullable: true }, scientific_evidence_notes: { type: Type.STRING, nullable: true }, important_cautions_disclaimer: { type: Type.STRING }}};
const useCasesHumanSymbiosisSchema = { type: Type.OBJECT, properties: { culinary_uses: { type: Type.ARRAY, items: culinaryUseItemSchema }, preservation_conservation_techniques_for_plant: { type: Type.ARRAY, items: preservationTechniqueSchema }, alternative_products_uses: { type: Type.ARRAY, items: alternativeProductUseItemSchema }, medicinal_uses_traditional_folk: { type: Type.ARRAY, items: medicinalUseItemSchema }, other_craft_material_uses: { type: Type.ARRAY, items: { type: Type.STRING } } } };
const seedSavingHarvestingGuideSchema = { type: Type.OBJECT, properties: { timing_indicators: { type: Type.STRING, nullable: true }, method_selection_criteria: { type: Type.STRING, nullable: true }}};
const optimalSeedStorageConditionsSchema = { type: Type.OBJECT, properties: { temperature_celsius: { type: Type.STRING, nullable: true }, humidity_percent: { type: Type.STRING, nullable: true }, container_type: { type: Type.STRING, nullable: true }, other_notes: { type: Type.STRING, nullable: true }}};
const seedSavingStorageDetailsSchema = { type: Type.OBJECT, properties: { seed_viability_duration_years_optimal: { type: Type.STRING, nullable: true }, harvesting_seeds_guide: seedSavingHarvestingGuideSchema, cleaning_drying_seeds_techniques: { type: Type.STRING, nullable: true }, optimal_storage_conditions: optimalSeedStorageConditionsSchema, seed_viability_testing_methods_description: { type: Type.ARRAY, items: { type: Type.STRING } } } };
const pruningShapingSchema = { type: Type.OBJECT, properties: { pruning_objectives: { type: Type.ARRAY, items: { type: Type.STRING } }, best_times_for_pruning_seasonal: { type: Type.ARRAY, items: { type: Type.STRING } }, pruning_techniques_description: { type: Type.STRING, nullable: true }, tools_recommended: { type: Type.ARRAY, items: { type: Type.STRING } }, pruning_notes_detailed: { type: Type.STRING, nullable: true }}};
const repottingSchema = { type: Type.OBJECT, nullable: true, properties: { repotting_frequency_indicators: { type: Type.STRING, nullable: true }, best_time_for_repotting: { type: Type.STRING, nullable: true }, repotting_instructions: { type: Type.STRING, nullable: true }}};
const propagationMethodsSummarySchema = { type: Type.OBJECT, properties: { primary_methods: { type: Type.ARRAY, items: { type: Type.STRING } }, seed_propagation_details: { type: Type.OBJECT, properties: { is_applicable: { type: Type.BOOLEAN }, brief_sowing_and_early_care_steps: { type: Type.ARRAY, items: { type: Type.STRING } } } }, cutting_propagation_details: { type: Type.OBJECT, properties: { is_applicable: { type: Type.BOOLEAN }, brief_step_by_step_overview: { type: Type.ARRAY, items: { type: Type.STRING } } } }, grafting_propagation_details: { type: Type.OBJECT, properties: { is_applicable: { type: Type.BOOLEAN }, brief_step_by_step_overview: { type: Type.ARRAY, items: { type: Type.STRING } } } } } };
const plantCareMaintenanceSchema = { type: Type.OBJECT, properties: { pruning_shaping: pruningShapingSchema, repotting_for_container_plants: repottingSchema, root_strengthening_techniques: { type: Type.ARRAY, items: { type: Type.STRING } }, propagation_methods_summary: propagationMethodsSummarySchema } };

const fullPlantSchema = {
    type: Type.OBJECT,
    properties: {
        plant_identification_overview: plantIdentificationOverviewSchema,
        key_features_uses_general: keyFeaturesUsesGeneralSchema,
        cultivation_growing_conditions: cultivationGrowingConditionsSchema,
        plant_nutrition_fertilization_needs: plantNutritionFertilizationNeedsSchema,
        plant_care_maintenance: plantCareMaintenanceSchema,
        growth_stage_timelines_days_from_sowing: growthStageTimelinesDaysFromSowingSchema,
        ecological_interactions: ecologicalInteractionsSchema,
        fruiting_harvesting_conditional: fruitingHarvestingConditionalSchema,
        annual_care_calendar_timeline_summary: annualCareCalendarTimelineSummarySchema,
        use_cases_human_symbiosis: useCasesHumanSymbiosisSchema,
        seed_saving_storage_details: seedSavingStorageDetailsSchema,
    }
};


// --- END: Full Plant Schema Definition for Gemini ---

const getResponseSchemaForSection = (sectionKey: PlantSectionKeyForAI) => {
    const sectionSchema = (fullPlantSchema.properties as any)[sectionKey];
    if (!sectionSchema) {
        console.warn(`No schema found for section: ${sectionKey}`);
        return { type: Type.OBJECT, properties: {} };
    }
    return {
        type: Type.OBJECT,
        properties: {
            [sectionKey]: sectionSchema
        }
    };
};

export const getAiAssistedDataForPlant = async (
    plantName: string,
    existingPlantData?: Partial<Plant>
): Promise<RawPlantDataFromAI> => {
    const allSectionKeys: PlantSectionKeyForAI[] = [
        'plant_identification_overview',
        'key_features_uses_general',
        'cultivation_growing_conditions',
        'plant_nutrition_fertilization_needs',
        'plant_care_maintenance',
        'growth_stage_timelines_days_from_sowing',
        'ecological_interactions',
        'fruiting_harvesting_conditional',
        'annual_care_calendar_timeline_summary',
        'use_cases_human_symbiosis',
        'seed_saving_storage_details'
    ];

    const promises = allSectionKeys.map(sectionKey =>
        getAiAssistedDataForPlantSection(plantName, sectionKey, existingPlantData)
            .catch(error => {
                console.warn(`Failed to fetch AI data for section ${sectionKey}. Skipping.`, error);
                return {}; // Return empty object on failure to not break Promise.all
            })
    );
    
    try {
        const results = await Promise.all(promises);
        const combinedData = results.reduce((acc, current) => ({ ...acc, ...current }), {});
        return combinedData as RawPlantDataFromAI;
    } catch (error) {
        console.error("Error getting full AI-assisted plant data:", error);
        throw error;
    }
};


export const getAiAssistedDataForPlantSection = async (
  plantName: string,
  sectionKey?: PlantSectionKeyForAI,
  existingPlantData?: Partial<Plant>,
  customPrompt?: string
): Promise<RawPlantDataFromAI> => {
  const model = getModel();

  const scientificName = existingPlantData?.plant_identification_overview?.latin_name_scientific_name;
  const commonName = plantName;

  let basePrompt;
  if (scientificName && scientificName.toLowerCase() !== 'not specified' && scientificName.toLowerCase() !== 'n/a') {
      basePrompt = `Generate a comprehensive data profile for the plant with scientific name "${scientificName}" (commonly known as "${commonName}").`;
  } else {
      basePrompt = `Generate a comprehensive data profile for the plant "${commonName}".`;
  }
  
  const prompt = customPrompt || `${basePrompt} ${sectionKey ? `Focus specifically on the '${sectionKey}' section.` : ''} Fill in as much detail as possible based on the provided JSON schema.`;
  
  const config = {
      responseMimeType: "application/json",
      responseSchema: sectionKey ? getResponseSchemaForSection(sectionKey) : getResponseSchemaForSection('plant_identification_overview') // Fallback schema
  };

  try {
    const response = await model.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: config,
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("AI response was empty.");
    }

    // Clean the response text before parsing
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonData = JSON.parse(cleanedText);

    return jsonData as RawPlantDataFromAI;
  } catch (error) {
    console.error("Error getting AI-assisted data:", error);
    throw error;
  }
};

export const generatePlantImageWithAi = async (plantName: string): Promise<string | null> => {
    const model = getModel();
    const prompt = `A single, vibrant, photorealistic image of a healthy ${plantName} plant, isolated on a clean, neutral studio background. Show the characteristic leaves and structure of the plant.`;

    try {
        const response = await model.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating plant image with AI:", error);
        throw error;
    }
};

export const generateGroundImageWithAi = async (plantNames: string[]): Promise<string | null> => {
  const model = getModel();
  const prompt = `A photorealistic image of a small, well-tended garden plot or raised bed. The plot contains a mix of healthy plants including ${plantNames.join(', ')}. The style is bright and inviting, showing a mix of foliage.`;

  try {
    const response = await model.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
    });
    if (response.generatedImages && response.generatedImages.length > 0) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating ground image with AI:", error);
    throw error;
  }
};

export const generateAvatarImageWithAi = async (userName: string): Promise<string | null> => {
    const model = getModel();
    const prompt = `A beautiful, artistic, abstract digital painting representing nature and growth, inspired by the name ${userName}. Use soft, organic shapes and a palette of greens, blues, and earth tones. Flat illustration, minimal, elegant avatar.`;

    try {
        const response = await model.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating AI avatar:", error);
        throw error;
    }
};

export const generateSeasonalTipCoverImageWithAi = async (tipTitle: string): Promise<string | null> => {
    const model = getModel();
    const prompt = `A beautiful, high-quality, vibrant photograph illustrating the concept of "${tipTitle}". The image should be inspiring, clear, and relevant to gardening.`;

    try {
        const response = await model.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating seasonal tip image with AI:", error);
        throw error;
    }
};

export const generateGroundTasksWithAi = async (
    groundName: string, 
    plantDetailsForPrompt: { plantName: string, datePlanted: string, currentStage: string, stageUpdatedAt: string }[],
    eventTypes: EventType[]
): Promise<{ description: string; dueDate: string; actionType: string }[]> => {
    const model = getModel();
    const today = new Date().toISOString().split('T')[0];
    const availableActionTypes = eventTypes.map(et => et.name);

    const formattedPlants = plantDetailsForPrompt.map(p => 
        `- ${p.plantName} (planted on ${p.datePlanted}, currently in ${p.currentStage} stage as of ${p.stageUpdatedAt})`
    ).join("\n");

    const prompt = `
        Based on the garden area "${groundName}", containing these plants:
        ${formattedPlants}

        Generate a list of 3 to 5 crucial, personalized gardening tasks for the next 4 weeks starting from today (${today}).

        For each task, provide:
        1. A short, actionable "description".
        2. A reasonable "dueDate" in **strict YYYY-MM-DD format**. Do not add extra text.
        3. An "actionType" from the following exact, case-sensitive list. You **must** use one of the provided types from the 'actionType' enum. Available types: [${availableActionTypes.join(', ')}]. If no type fits, use "Other".

        Consider the current growth stage and time since planting to determine task urgency (e.g., checking for pests, pinching/pruning, preparing for harvest).
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                actionType: { type: Type.STRING, enum: availableActionTypes }
            },
            required: ["description", "dueDate", "actionType"]
        }
    };

    try {
        const response = await model.models.generateContent({
            model: geminiModel,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });
        const textResponse = response.text.trim();
        // Handle potential cases where the response is not a valid JSON array string
        if (!textResponse.startsWith('[')) {
            console.warn("AI did not return a valid JSON array. Response:", textResponse);
            return [];
        }
        const jsonData = JSON.parse(textResponse);
        return jsonData as { description: string; dueDate: string; actionType: string }[];
    } catch (error) {
        console.error("Error generating ground tasks with AI:", error);
        throw error;
    }
};
