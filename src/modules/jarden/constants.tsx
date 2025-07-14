

import React from 'react';
import {
  ActiveModuleType, MonthAbbreviation, GroundLogActionType, GrowingGround, PlantStage, EventType, PlantCalendarTaskType,
} from './types';
import { 
    CogIcon, BoltIcon, ArrowPathIcon, WrenchScrewdriverIcon, ArchiveBoxIcon, 
    SparklesIcon as SparklesOutlineIcon, StarIcon, InboxStackIcon, 
    InformationCircleIcon, AcademicCapIcon, PresentationChartLineIcon,
    PaintBrushIcon, ScissorsIcon, CloudIcon, EyeIcon, ChatBubbleLeftEllipsisIcon,
    ShieldExclamationIcon, TrashIcon, CheckCircleIcon, ListBulletIcon, PlusCircleIcon,
    ExclamationCircleIcon, AdjustmentsHorizontalIcon, ClockIcon, PaperAirplaneIcon, BookOpenIcon,
    ClipboardDocumentListIcon, BugAntIcon, TagIcon
} from '@heroicons/react/24/outline';
import { 
    HomeIcon, PlantsIcon, GroundsIcon, TasksIcon, TipsIcon, ProfileIcon,
    FertilizerIcon, CompostIcon, SettingsIcon
} from './components/icons/JardenIcons';


export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';
export const LOCAL_STORAGE_WEATHER_PREF_KEY = 'jardenWeatherPreference';

export const MONTH_ABBREVIATIONS: MonthAbbreviation[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


export const EVENT_TYPES_SEED_DATA: Omit<EventType, 'id'>[] = [
    { name: 'Pruning', icon_name: '✂️', color_code: '#b91c1c', description: 'Cutting back plants to encourage health and growth.' },
    { name: 'Harvest', icon_name: '🧺', color_code: '#f97316', description: 'Gathering mature crops.' },
    { name: 'Weeding', icon_name: '🌿', color_code: '#10b981', description: 'Removing unwanted plants.' },
    { name: 'Soil Amendment', icon_name: '✨', color_code: '#8b5cf6', description: 'Improving soil quality with additives.' },
    { name: 'Watering', icon_name: '💧', color_code: '#38bdf8', description: 'Providing water to plants.' },
    { name: 'Observation', icon_name: '👀', color_code: '#2563eb', description: 'Watching for changes or issues.' },
    { name: 'Fertilization', icon_name: '⚡️', color_code: '#ca8a04', description: 'Adding nutrients to the soil.' },
    { name: 'Inspection', icon_name: '🧐', color_code: '#7c3aed', description: 'Closely examining plants for pests or diseases.' },
    { name: 'Maintenance', icon_name: '🛠️', color_code: '#4b5563', description: 'General upkeep tasks.' },
    { name: 'Planting', icon_name: '🌱', color_code: '#16a34a', description: 'Adding new plants to the garden.' },
    { name: 'Pest Control', icon_name: '🐞', color_code: '#dc2626', description: 'Managing or eliminating harmful pests.' },
    { name: 'Other', icon_name: '📝', color_code: '#9ca3af', description: 'Miscellaneous tasks.' },
];


export const PLANT_TASK_TYPE_ICONS: Record<PlantCalendarTaskType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  SowIndoors: PlusCircleIcon,
  SowOutdoors: PlusCircleIcon,
  Transplant: ArrowPathIcon,
  Prune: ScissorsIcon,
  Fertilize: BoltIcon,
  Harvest: ArchiveBoxIcon,
  Maintenance: WrenchScrewdriverIcon,
  Germinate: SparklesOutlineIcon,
  FlowerWatch: EyeIcon,
  FruitWatch: EyeIcon,
  SeedCollect: InboxStackIcon,
  Other: InformationCircleIcon
};


export const PLANT_STAGES: PlantStage[] = ['Planning', 'Seeded', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Dormant', 'Harvested', 'Failed', 'Removed'];

export const GROUND_LOG_ACTION_TYPES: GroundLogActionType[] = [
  'Planting', 'Water', 'Fertilize', 'Prune', 'Trim', 'Weeding', 'Mulching', 'Maintenance',
  'Pest Control', 'Disease Management', 'Soil Amendment',
  'Harvest', 'Observation', 'Stage Update', 'Inspection', 'Intervention', 'Other'
];

export const GROUND_LOG_ACTION_TYPE_ICONS: Record<GroundLogActionType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Planting: PlusCircleIcon,
  Water: CloudIcon, 
  Fertilize: BoltIcon,
  Prune: ScissorsIcon,
  Trim: PaintBrushIcon, 
  Weeding: TrashIcon, 
  Mulching: ArchiveBoxIcon, 
  Maintenance: CogIcon,
  'Pest Control': ShieldExclamationIcon,
  'Disease Management': ShieldExclamationIcon, 
  'Soil Amendment': AdjustmentsHorizontalIcon, 
  Harvest: ArchiveBoxIcon,
  Observation: EyeIcon,
  'Stage Update': ClipboardDocumentListIcon,
  'Inspection': EyeIcon,
  'Intervention': ShieldExclamationIcon,
  Other: InformationCircleIcon
};



export const FERTILIZER_SECTION_LABELS: Record<string, string> = { 
  name: 'Fertilizer Name',
  type: 'Type (Organic/Synthetic)',
  form: 'Form (Liquid/Granular)',
  imageUrl: 'Image URL',
  description: 'Description',
  primaryUses: 'Primary Uses',
  ingredients: 'Ingredients / Composition',
  npkRatio: 'NPK Ratio (N-P-K)',
  secondaryMicronutrients: 'Secondary & Micronutrients',
  phImpact: 'pH Impact on Soil',
  electricalConductivity: 'Electrical Conductivity (EC)',
  applicationMethods: 'Application Methods',
  applicationFrequency: 'Application Frequency',
  dilutionRate: 'Dilution Rate (if applicable)',
  releaseProfile: 'Nutrient Release Profile',
  targetPlants: 'Target Plants / Best For',
  bestPlantStages: 'Best Plant Stages for Use',
  storageRequirements: 'Storage Requirements',
  shelfLife: 'Shelf Life',
  safetyPrecautions: 'Safety Precautions',
  compatibilityNotes: 'Compatibility with Other Products',
  userNotes: 'User Notes',
  informationSources: 'Information Sources',
  id: 'ID',
  fertilizer_name: 'Fertilizer Name', 
  fertilizer_id_sku: 'SKU/ID',
};

export const COMPOSTING_METHOD_LABELS: Record<string, string> = { 
  name: 'Method Name',
  approach: 'Approach / Type',
  imageUrl: 'Image URL',
  description: 'Method Description',
  complexity: 'Complexity Level',
  scale: 'Suitable Scale',
  timeToMature: 'Time to Mature Compost',
  systemDesignSetup: 'System Design & Setup',
  inputMaterialsGreen: 'Green Materials (Nitrogen-rich)',
  inputMaterialsBrown: 'Brown Materials (Carbon-rich)',
  optimalCNRatio: 'Optimal Carbon-to-Nitrogen Ratio',
  materialsToStrictlyAvoid: 'Materials to Strictly Avoid',
  processManagement: 'Process Management & Monitoring',
  leachateManagement: 'Leachate Management',
  troubleshootingCommonIssues: 'Troubleshooting Common Issues',
  finishedCompostCharacteristics: 'Finished Compost Characteristics',
  harvestingAndUsingCompost: 'Harvesting & Using Compost',
  methodSpecifics: 'Method-Specific Details',
  environmentalBenefits: 'Environmental Benefits',
  userNotes: 'User Notes',
  informationSources: 'Information Sources',
  id: 'ID',
  method_name: 'Method Name', 
  composting_method_id: 'Method ID',
  primary_composting_approach: 'Primary Approach',
  scale_of_operation: 'Scale of Operation',
  produced_fertilizer_id: 'Produced Fertilizer ID'
};

export const GROWING_GROUND_LABELS: Record<string, string> = { 
  id: "ID",
  name: "Name / Identifier",
  description: "Description",
  type: "Type of Ground",
  imageUrl: "Image URL",
  lightHoursMorning: "Morning Sun Hours (Direct)",
  lightHoursAfternoon: "Afternoon Sun Hours (Direct)",
  soilType: "Soil Type",
  customSoilDescription: "Custom Soil Details / Amendments",
  areaDimensions: "Area Dimensions / Size",
  plants: "Plants in this Ground",
  logs: "Activity Log",
  customNotes: "Custom Notes",
  informationSources: "Information Sources (e.g., soil test results link)"
};

export const GROUND_TYPES: GrowingGround['type'][] = [
  'Raised Bed', 'Ground Bed', 'Pot', 'Container', 'Vertical Garden', 
  'Greenhouse Bed', 'Hydroponics', 'Aquaponics', 'Other'
];


export const MODULES: {
  id: ActiveModuleType | 'home' | 'profile' | 'settings'; 
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  baseColorClass: string; 
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
  navRailContainerBg: string;
  navRailIconColor: string;
  navRailTextColor: string;
  listItemSelectedBg: string;
  listItemSelectedText: string;
  listItemHoverBg: string;
}[] = [
  {
    id: 'home', name: 'Home', icon: HomeIcon, baseColorClass: 'blue',
    bgColor: 'bg-blue-600 dark:bg-blue-500', textColor: 'text-white', hoverBgColor: 'hover:bg-blue-700 dark:hover:bg-blue-600',
    navRailContainerBg: 'bg-blue-100 dark:bg-blue-800', navRailIconColor: 'text-blue-600 dark:text-blue-300', navRailTextColor: 'text-blue-700 dark:text-blue-200',
    listItemSelectedBg: 'bg-blue-100 dark:bg-blue-700', listItemSelectedText: 'text-blue-800 dark:text-blue-100', listItemHoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-600'
  },
  {
    id: 'florapedia', name: 'Explore', icon: PlantsIcon, baseColorClass: 'green',
    bgColor: 'bg-green-600 dark:bg-green-500', textColor: 'text-white', hoverBgColor: 'hover:bg-green-700 dark:hover:bg-green-600',
    navRailContainerBg: 'bg-green-100 dark:bg-green-800', navRailIconColor: 'text-green-600 dark:text-green-300', navRailTextColor: 'text-green-700 dark:text-green-200',
    listItemSelectedBg: 'bg-green-100 dark:bg-green-700', listItemSelectedText: 'text-green-800 dark:text-green-100', listItemHoverBg: 'hover:bg-green-50 dark:hover:bg-green-600'
  },
  {
    id: 'growinggrounds', name: 'My Jarden', icon: GroundsIcon, baseColorClass: 'purple', 
    bgColor: 'bg-purple-600 dark:bg-purple-500', textColor: 'text-white', hoverBgColor: 'hover:bg-purple-700 dark:hover:bg-purple-600',
    navRailContainerBg: 'bg-purple-100 dark:bg-purple-800', navRailIconColor: 'text-purple-600 dark:text-purple-300', navRailTextColor: 'text-purple-700 dark:text-purple-200',
    listItemSelectedBg: 'bg-purple-100 dark:bg-purple-700', listItemSelectedText: 'text-purple-800 dark:text-purple-100', listItemHoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-600'
  },
  {
    id: 'calendar', name: 'Tasks', icon: TasksIcon, baseColorClass: 'rose',
    bgColor: 'bg-rose-600 dark:bg-rose-500', textColor: 'text-white', hoverBgColor: 'hover:bg-rose-700 dark:hover:bg-rose-600',
    navRailContainerBg: 'bg-rose-100 dark:bg-rose-800', navRailIconColor: 'text-rose-600 dark:text-rose-300', navRailTextColor: 'text-rose-700 dark:text-rose-200',
    listItemSelectedBg: 'bg-rose-100 dark:bg-rose-700', listItemSelectedText: 'text-rose-800 dark:text-rose-100', listItemHoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-600'
  },
  {
    id: 'seasonaltips', name: 'Tips', icon: TipsIcon, baseColorClass: 'orange',
    bgColor: 'bg-orange-600 dark:bg-orange-500', textColor: 'text-white', hoverBgColor: 'hover:bg-orange-700 dark:hover:bg-orange-600',
    navRailContainerBg: 'bg-orange-100 dark:bg-orange-800', navRailIconColor: 'text-orange-600 dark:text-orange-300', navRailTextColor: 'text-orange-700 dark:text-orange-200',
    listItemSelectedBg: 'bg-orange-100 dark:bg-orange-700', listItemSelectedText: 'text-orange-800 dark:text-orange-100', listItemHoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-600'
  },
  {
    id: 'profile', name: 'Profile', icon: ProfileIcon, baseColorClass: 'teal', 
    bgColor: 'bg-teal-600 dark:bg-teal-500', textColor: 'text-white', hoverBgColor: 'hover:bg-teal-700 dark:hover:bg-teal-600',
    navRailContainerBg: 'bg-teal-100 dark:bg-teal-800', navRailIconColor: 'text-teal-600 dark:text-teal-300', navRailTextColor: 'text-teal-700 dark:text-teal-200',
    listItemSelectedBg: 'bg-teal-100 dark:bg-teal-700', listItemSelectedText: 'text-teal-800 dark:text-teal-100', listItemHoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-600'
  },
   {
    id: 'nutribase', name: 'NutriBase', icon: FertilizerIcon, baseColorClass: 'sky', 
    bgColor: 'bg-sky-600 dark:bg-sky-500', textColor: 'text-white', hoverBgColor: 'hover:bg-sky-700 dark:hover:bg-sky-600',
    navRailContainerBg: 'bg-sky-100 dark:bg-sky-800', navRailIconColor: 'text-sky-600 dark:text-sky-300', navRailTextColor: 'text-sky-700 dark:text-sky-200',
    listItemSelectedBg: 'bg-sky-100 dark:bg-sky-700', listItemSelectedText: 'text-sky-800 dark:text-sky-100', listItemHoverBg: 'hover:bg-sky-50 dark:hover:bg-sky-600'
  },
  {
    id: 'compostcorner', name: 'Compost', icon: CompostIcon, baseColorClass: 'yellow', 
    bgColor: 'bg-yellow-500 dark:bg-yellow-400', textColor: 'text-neutral-900', hoverBgColor: 'hover:bg-yellow-600 dark:hover:bg-yellow-500',
    navRailContainerBg: 'bg-yellow-100 dark:bg-yellow-800', navRailIconColor: 'text-yellow-600 dark:text-yellow-300', navRailTextColor: 'text-yellow-700 dark:text-yellow-200',
    listItemSelectedBg: 'bg-yellow-100 dark:bg-yellow-700', listItemSelectedText: 'text-yellow-800 dark:text-yellow-100', listItemHoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-600'
  }
];
