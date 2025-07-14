# Private Developer README for senande.life

> **This file is private and should not be tracked by git.**
const apiKey = process.env.GEMINI_API_KEY;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

buckets:
flora-pedia-images (images for each plant of table flora_pedia)
fertilizer-images (images for the fertilizers of table nutri_base)
compost-method-images (images for composts of table compost_corners)
growing-grounds-gallery-images (images for the growing grounds of table growing_grounds)
growing-grounds-log-entry-photos (images for the growing grounds activity logs)
user-avatar
seasonal-tips-images (images for the seasonal tips of table seasonal_tips)

## Table of Contents
- [AI Prompts & Usage](#ai-prompts--usage)
- [Data Actions](#data-actions)
- [Data Structures](#data-structures)
- [Developer Build-Time Instructions](#developer-build-time-instructions)
- [Advanced Notes](#advanced-notes)

---

## AI Prompts & Usage

### Standard AI Prompts
- **Plant Data Population**
  - Standard prompt (in `geminiService.ts`):
    ```js
    Generate a comprehensive data profile for the plant "<plantName>". <If sectionKey> Focus specifically on the '<sectionKey>' section. Fill in as much detail as possible based on the provided JSON schema.
    ```
- **Custom AI Prompts**
  - Users can enter any prompt via the `CustomAiPromptModal` (see `CustomAiPromptModal.tsx`).
  - Example UI guidance:
    > Enter detailed instructions. The AI will populate the plant's profile or a specific section based on your prompt and the standard data structure.
    > E.g., "Focus on drought-tolerance, companion plants for aphids, arid climate uses, historical significance."
- **Ground Task Generation**
  - Prompt (in `geminiService.ts`):
    ```js
    Given a garden area named "<groundName>" which contains the following plants: <plantDetails>.
    Suggest a list of 3 to 5 crucial upcoming gardening tasks for the next 4 weeks.
    For each task, provide a description, a reasonable due date in YYYY-MM-DD format (starting from today, <today>), and a suitable actionType.
    Focus on common seasonal activities like pruning, fertilizing, pest observation, and soil maintenance.
    ```
- **Image Generation**
  - Plant image: "A single, vibrant, photorealistic image of a healthy <plantName> plant, isolated on a clean, neutral studio background. Show the characteristic leaves and structure of the plant."
  - Ground image: "A photorealistic image of a small, well-tended garden plot or raised bed. The plot contains a mix of healthy plants including <plantNames>. The style is bright and inviting, showing a mix of foliage."
  - Avatar: "A beautiful, artistic, abstract digital painting representing nature and growth, inspired by the name <userName>. Use soft, organic shapes and a palette of greens, blues, and earth tones. Flat illustration, minimal, elegant avatar."
  - Seasonal tip: "A beautiful, high-quality, vibrant photograph illustrating the concept of '<tipTitle>'. The image should be inspiring, clear, and relevant to gardening."

### Where Prompts Are Used
- `src/modules/jarden/services/geminiService.ts` (all AI logic)
- `src/modules/jarden/components/CustomAiPromptModal.tsx` (custom prompt UI)
- `src/modules/jarden/components/PlantDetailView.tsx` (AI fill buttons)

---

## Data Actions

### Main Data Actions
- **Plant CRUD**: `addPlant`, `updatePlant`, `getPlants` (in `supabaseService.ts`)
- **Fertilizer CRUD**: `addFertilizer`, `updateFertilizer`, `getFertilizers`
- **Composting Method CRUD**: `addCompostingMethod`, `updateCompostingMethod`, `getCompostingMethods`
- **Growing Ground CRUD**: `addGrowingGround`, `updateGrowingGround`, `getGrowingGrounds`, `deleteGrowingGround`
- **Seasonal Tips**: `getSeasonalTips`, `addSeasonalTip`, `updateSeasonalTip`
- **Recent Views**: `addRecentView`, `getRecentViews`
- **AI Data Actions**:
  - `getAiAssistedDataForPlantSection` (AI plant data population)
  - `generateGroundTasksWithAi` (AI gardening task suggestions)
  - `generatePlantImageWithAi`, `generateGroundImageWithAi`, `generateAvatarImageWithAi`, `generateSeasonalTipCoverImageWithAi` (AI image generation)

### Data Action Locations
- All main actions are in `src/modules/jarden/services/supabaseService.ts` and `src/modules/jarden/services/geminiService.ts`.

---

## Data Structures

### Main Types (see `src/modules/jarden/types.ts`)
- **Plant**: Rich, nested structure for all plant data (see README for example)
- **Fertilizer**: Includes type, form, and detailed data (NPK, ingredients, etc.)
- **CompostingMethod**: Composting approach, complexity, materials, process, etc.
- **GrowingGround**: Describes a garden bed/area, plants, logs, tasks, etc.
- **SeasonalTip**: Tips, articles, images, tags, author, etc.
- **UserProfile**: User preferences, avatar, etc.
- **AIQueryLog**: Stores prompt, model, response summary, and confidence
- **CustomAiPromptModalData**: Used for custom prompt modal state

### Example: PlantSectionKeyForAI
```ts
type PlantSectionKeyForAI =
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
```

---

## Developer Build-Time Instructions

### Environment
- Node.js 18+ recommended
- Install dependencies: `npm install`
- Environment variables:
  - `GEMINI_API_KEY` (required for AI features)
  - Supabase credentials (URL, anon/public key)
- Run dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

### TypeScript
- Strict mode enabled
- Paths alias: `@/*` maps to project root
- See `tsconfig.json` for details

### Vite
- See `vite.config.ts` for custom env and alias setup
- TailwindCSS is loaded via CDN in `index.html` and module HTML files

### Adding New Modules
- Create a folder in `src/modules/`
- Add entry point (e.g., `index.tsx`)
- Register route in `App.tsx`
- Add types to `types.ts` as needed

### AI Integration
- All AI calls are routed through `services/gemini.ts` and `src/modules/jarden/services/geminiService.ts`
- Prompts and schemas can be customized per section or use case
- For new AI features, add prompt logic in `geminiService.ts` and UI in a modal/component

---

## Advanced Notes
- **Supabase**: All data is stored in JSONB columns for flexibility
- **AI Query Logging**: Each AI-assisted data action can be logged via `AIQueryLog` in the data model
- **Image Handling**: Images can be stored as URLs or base64 strings
- **Custom Prompts**: Advanced users can use the modal to instruct the AI for any plant section or the whole profile
- **Testing**: Use mock data or seeders in `supabaseSeedData.ts` for local development

---

For further questions, contact the lead developer or see inline code comments in the relevant files. 