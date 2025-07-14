# senande.life

A modular digital ecosystem for empowering sustainable living. Join our community of sustainability enthusiasts. Access knowledge, tools, and connect with like-minded individuals committed to a greener future.

## Table of Contents
- [Project Overview](#project-overview)
- [Core Modules](#core-modules)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Data Model Overview](#data-model-overview)
- [AI Integration](#ai-integration)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview
senande.life is a modular platform dedicated to empowering sustainable living by building a connected global community and providing the tools for a greener future. The platform is designed for sustainability enthusiasts from all walks of life—from curious beginners to seasoned experts.

Our vision is to make sustainable choices easy and intuitive for everyone, accelerating the transition to a more sustainable and equitable world.

## Core Modules
- **Educa**: Center for sustainable knowledge and learning. Offers articles, guides, and courses on all things sustainable.
- **Jarden**: Your digital garden. Manage your plants, track progress, and get AI-powered tips.
- **Polisaw** (planned): Guidance on navigating regulations and policies for sustainable living.

Each module is dedicated to a specific aspect of sustainable living and can be extended or customized.

## Features
- Modular architecture for extensibility
- AI-powered plant data population and gardening task suggestions
- User authentication and profile management
- Plant encyclopedia (FloraPedia), fertilizer and compost databases
- Seasonal tips, calendar, and garden management tools
- Custom AI prompt interface for advanced users

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend/DB**: Supabase (PostgreSQL)
- **AI**: Google Gemini (via @google/genai)
- **Other**: Immer, Heroicons, React Router, React Markdown

## Project Structure
```
/ (root)
├── App.tsx                # Main app shell, routing, and providers
├── pages/                 # Landing, About, and other static pages
├── components/            # Shared UI components
├── context/               # Auth and global context providers
├── services/              # API, AI, and DB service wrappers
├── src/modules/educa/     # Educa module (knowledge center)
├── src/modules/jarden/    # Jarden module (digital garden)
│   ├── components/        # Jarden-specific UI (modals, detail views, etc.)
│   ├── services/          # Data, AI, and DB logic for Jarden
│   ├── utils/             # Utility functions for data manipulation
│   ├── types.ts           # All main data structures and types
│   └── constants.tsx      # Module constants
├── assets/                # Images and static assets
├── index.html             # Main HTML entry
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build/dev config
└── .gitignore             # Git ignore rules
```

## Setup & Installation
1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd senande.life_project
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set your `GEMINI_API_KEY` (Google GenAI) and Supabase credentials.
4. **Run the development server:**
   ```sh
   npm run dev
   ```
5. **Build for production:**
   ```sh
   npm run build
   ```
6. **Preview production build:**
   ```sh
   npm run preview
   ```

## Environment Variables
- `GEMINI_API_KEY`: Google GenAI API key (required for AI features)
- Supabase credentials: URL, anon/public key, etc.

## Data Model Overview
The Jarden module uses a rich, extensible data model for plants, fertilizers, composting methods, growing grounds, and more. All main types are defined in `src/modules/jarden/types.ts`.

### Example: Plant Data Structure
```ts
export interface Plant {
  id: string;
  display_image_url: string | null;
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
```
Other types include Fertilizer, CompostingMethod, GrowingGround, SeasonalTip, and more.

## AI Integration
- **AI Provider**: Google Gemini (via @google/genai)
- **Features**:
  - Populate plant data sections with AI (standard or custom prompts)lets add modules, brainstorm and develop the ideas

Menu - saves the menu available in the order
Recipes - the recipes for each product on the menu
  - Generate gardening tasks for grounds
  - Generate images for plants, grounds, avatars, and seasonal tips
- **Custom Prompts**: Users can enter detailed instructions for AI to populate specific plant sections or profiles.
- **Prompt Modal**: Accessible via the Jarden module UI for advanced data entry.

## Development
- **TypeScript**: Strict mode, modern ES2020+ features
- **Vite**: Fast dev server and build
- **TailwindCSS**: Utility-first styling
- **Modular**: Add new modules by creating a folder in `src/modules/` and registering routes in `App.tsx`
- **Auth**: Provided by Supabase and custom context

## Contributing
1. Fork the repo and create a feature branch
2. Follow the code style and naming conventions
3. Add/modify types in `src/modules/jarden/types.ts` as needed
4. Test your changes locally
5. Submit a pull request with a clear description

## License
[MIT](LICENSE)

---

For more details, see the private developer README (`private_readme.md`, not tracked in git).
