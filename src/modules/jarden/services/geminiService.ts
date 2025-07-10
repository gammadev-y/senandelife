
import { ai, geminiModel } from '../../../../services/gemini';
import { Plant, PlantSectionKeyForAI, RawPlantDataFromAI, RawPlantSectionDataFromAI, GroundLogActionType } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const getModel = () => {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. Check API_KEY.");
  }
  return ai;
};

// ... (schema definitions would go here, but are omitted for brevity as they are very long)
// A simplified placeholder for the schema generation logic
const getResponseSchemaForSection = (sectionKey: PlantSectionKeyForAI) => {
    // In a real app, this would return a complex, specific schema for each section.
    // For this example, we'll return a generic object schema.
    return { type: Type.OBJECT, properties: {} };
};


export const getAiAssistedDataForPlantSection = async (
  plantName: string,
  sectionKey?: PlantSectionKeyForAI,
  existingPlantData?: Partial<Plant>,
  customPrompt?: string
): Promise<RawPlantDataFromAI> => {
  const model = getModel();
  
  const prompt = customPrompt || `Generate a comprehensive data profile for the plant "${plantName}". ${sectionKey ? `Focus specifically on the '${sectionKey}' section.` : ''} Fill in as much detail as possible based on the provided JSON schema.`;
  
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

export const generateGroundTasksWithAi = async (groundName: string, plantDetails: string): Promise<{ description: string; dueDate: string; actionType: GroundLogActionType }[]> => {
    const model = getModel();
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const prompt = `
        Given a garden area named "${groundName}" which contains the following plants: ${plantDetails}.
        Suggest a list of 3 to 5 crucial upcoming gardening tasks for the next 4 weeks.
        For each task, provide a description, a reasonable due date in YYYY-MM-DD format (starting from today, ${today.toISOString().split('T')[0]}), and a suitable actionType.
        Focus on common seasonal activities like pruning, fertilizing, pest observation, and soil maintenance.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                dueDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                actionType: { type: Type.STRING, enum: ['Planting', 'Water', 'Fertilize', 'Prune', 'Trim', 'Weeding', 'Mulching', 'Maintenance', 'Pest Control', 'Disease Management', 'Soil Amendment', 'Harvest', 'Observation', 'Other'] }
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
        const jsonData = JSON.parse(response.text.trim());
        return jsonData as { description: string; dueDate: string; actionType: GroundLogActionType }[];
    } catch (error) {
        console.error("Error generating ground tasks with AI:", error);
        throw error;
    }
};
