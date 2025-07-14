import { GoogleGenAI } from '@google/genai';

// IMPORTANT: The API key must be loaded from environment variables.
// This is a hard requirement for the project.
const apiKey = process.env.API_KEY;


if (!apiKey) {
  console.error(
    'Google GenAI API Key not set. Please provide API_KEY as an environment variable.'
  );
  // In a real application, you should throw an error to prevent the app from
  // running without a valid configuration.
  // throw new Error('Google GenAI API Key is required.');
}

// Initialize the Google AI client, but handle the case where the key might be missing.
export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// It's good practice to export the model name as a constant to ensure consistency.
export const geminiModel = 'gemini-2.5-flash';

/**
 * A placeholder service function for generating text with the Gemini API.
 * This demonstrates how you might structure your service calls.
 * @param {string} contents - The text prompt to send to the model.
 * @returns {Promise<string>} The generated text from the model.
 */
export async function generateText(contents: string): Promise<string> {
  if (!ai) {
    const errorMsg = 'Gemini AI client is not initialized.';
    console.error(errorMsg);
    return Promise.reject(errorMsg);
  }

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents,
    });
    return response.text;
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}