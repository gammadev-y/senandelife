
import React from 'react';
import {
  ActiveModuleType, MonthAbbreviation, PlantCalendarTaskType, GroundLogActionType, GrowingGround,
} from './types';
import { 
    HomeIcon as HomeOutlineIcon, MagnifyingGlassIcon, MapIcon as MapOutlineIcon, 
    CalendarDaysIcon as CalendarOutlineIcon, BeakerIcon, CubeTransparentIcon, 
    CogIcon, BoltIcon, ArrowPathIcon, WrenchScrewdriverIcon, ArchiveBoxIcon, 
    SparklesIcon as SparklesOutlineIcon, StarIcon, InboxStackIcon, LightBulbIcon as OutlineLightBulbIcon, 
    InformationCircleIcon, AcademicCapIcon, PresentationChartLineIcon, UserCircleIcon,
    PaintBrushIcon, ScissorsIcon, CloudIcon, EyeIcon, ChatBubbleLeftEllipsisIcon,
    ShieldExclamationIcon, TrashIcon, CheckCircleIcon, ListBulletIcon, PlusCircleIcon,
    ExclamationCircleIcon, AdjustmentsHorizontalIcon, ClockIcon, PaperAirplaneIcon, BookOpenIcon
} from '@heroicons/react/24/outline';
import LeafIcon from './components/icons/LeafIcon';
import LightBulbIcon from './components/icons/LightBulbIcon'; 


export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';
export const LOCAL_STORAGE_WEATHER_PREF_KEY = 'jardenWeatherPreference';

export const MONTH_ABBREVIATIONS: MonthAbbreviation[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PLANT_CALENDAR_TASK_TYPES: PlantCalendarTaskType[] = [
  'SowIndoors', 'SowOutdoors', 'Transplant', 'Germinate', 'Prune', 'Fertilize', 'Harvest', 'Maintenance', 'FlowerWatch', 'FruitWatch', 'SeedCollect', 'Other'
];

export const PLANT_TASK_TYPE_ICONS: Record<PlantCalendarTaskType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  SowIndoors: InboxStackIcon,
  SowOutdoors: CloudIcon, 
  Transplant: ArrowPathIcon,
  Germinate: LightBulbIcon,
  Prune: ScissorsIcon, 
  Fertilize: BoltIcon,
  Harvest: ArchiveBoxIcon,
  Maintenance: CogIcon,
  FlowerWatch: SparklesOutlineIcon,
  FruitWatch: StarIcon,
  SeedCollect: InboxStackIcon,
  Other: InformationCircleIcon
};

export const GROUND_LOG_ACTION_TYPES: GroundLogActionType[] = [
  'Planting', 'Water', 'Fertilize', 'Prune', 'Trim', 'Weeding', 'Mulching', 'Maintenance',
  'Pest Control', 'Disease Management', 'Soil Amendment',
  'Harvest', 'Observation', 'Other'
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
  Other: InformationCircleIcon
};

export const PLANT_TO_GROUND_TASK_TYPE_MAP: Record<PlantCalendarTaskType, GroundLogActionType> = {
  SowIndoors: 'Planting',
  SowOutdoors: 'Planting',
  Transplant: 'Planting',
  Germinate: 'Observation',
  Prune: 'Prune',
  Fertilize: 'Fertilize',
  Harvest: 'Harvest',
  Maintenance: 'Maintenance',
  FlowerWatch: 'Observation',
  FruitWatch: 'Observation',
  SeedCollect: 'Harvest',
  Other: 'Other',
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
  calendarTasks: "Calendar Tasks",
  customNotes: "Custom Notes",
  informationSources: "Information Sources (e.g., soil test results link)"
};

export const GROUND_TYPES: GrowingGround['type'][] = [
  'Raised Bed', 'Ground Bed', 'Pot', 'Container', 'Vertical Garden', 
  'Greenhouse Bed', 'Hydroponics', 'Aquaponics', 'Other'
];


export const MODULES: {
  id: ActiveModuleType | 'home' | 'profile'; 
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
    id: 'home', name: 'Home', icon: HomeOutlineIcon, baseColorClass: 'blue',
    bgColor: 'bg-blue-600 dark:bg-blue-500', textColor: 'text-white', hoverBgColor: 'hover:bg-blue-700 dark:hover:bg-blue-600',
    navRailContainerBg: 'bg-blue-100 dark:bg-blue-800', navRailIconColor: 'text-blue-600 dark:text-blue-300', navRailTextColor: 'text-blue-700 dark:text-blue-200',
    listItemSelectedBg: 'bg-blue-100 dark:bg-blue-700', listItemSelectedText: 'text-blue-800 dark:text-blue-100', listItemHoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-600'
  },
  {
    id: 'florapedia', name: 'Explore', icon: MagnifyingGlassIcon, baseColorClass: 'green',
    bgColor: 'bg-green-600 dark:bg-green-500', textColor: 'text-white', hoverBgColor: 'hover:bg-green-700 dark:hover:bg-green-600',
    navRailContainerBg: 'bg-green-100 dark:bg-green-800', navRailIconColor: 'text-green-600 dark:text-green-300', navRailTextColor: 'text-green-700 dark:text-green-200',
    listItemSelectedBg: 'bg-green-100 dark:bg-green-700', listItemSelectedText: 'text-green-800 dark:text-green-100', listItemHoverBg: 'hover:bg-green-50 dark:hover:bg-green-600'
  },
  {
    id: 'growinggrounds', name: 'My Jarden', icon: LeafIcon, baseColorClass: 'purple', 
    bgColor: 'bg-purple-600 dark:bg-purple-500', textColor: 'text-white', hoverBgColor: 'hover:bg-purple-700 dark:hover:bg-purple-600',
    navRailContainerBg: 'bg-purple-100 dark:bg-purple-800', navRailIconColor: 'text-purple-600 dark:text-purple-300', navRailTextColor: 'text-purple-700 dark:text-purple-200',
    listItemSelectedBg: 'bg-purple-100 dark:bg-purple-700', listItemSelectedText: 'text-purple-800 dark:text-purple-100', listItemHoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-600'
  },
  {
    id: 'calendar', name: 'Tasks', icon: CalendarOutlineIcon, baseColorClass: 'rose',
    bgColor: 'bg-rose-600 dark:bg-rose-500', textColor: 'text-white', hoverBgColor: 'hover:bg-rose-700 dark:hover:bg-rose-600',
    navRailContainerBg: 'bg-rose-100 dark:bg-rose-800', navRailIconColor: 'text-rose-600 dark:text-rose-300', navRailTextColor: 'text-rose-700 dark:text-rose-200',
    listItemSelectedBg: 'bg-rose-100 dark:bg-rose-700', listItemSelectedText: 'text-rose-800 dark:text-rose-100', listItemHoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-600'
  },
  {
    id: 'seasonaltips', name: 'Tips', icon: LightBulbIcon, baseColorClass: 'orange',
    bgColor: 'bg-orange-600 dark:bg-orange-500', textColor: 'text-white', hoverBgColor: 'hover:bg-orange-700 dark:hover:bg-orange-600',
    navRailContainerBg: 'bg-orange-100 dark:bg-orange-800', navRailIconColor: 'text-orange-600 dark:text-orange-300', navRailTextColor: 'text-orange-700 dark:text-orange-200',
    listItemSelectedBg: 'bg-orange-100 dark:bg-orange-700', listItemSelectedText: 'text-orange-800 dark:text-orange-100', listItemHoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-600'
  },
  {
    id: 'profile', name: 'Profile', icon: UserCircleIcon, baseColorClass: 'teal', 
    bgColor: 'bg-teal-600 dark:bg-teal-500', textColor: 'text-white', hoverBgColor: 'hover:bg-teal-700 dark:hover:bg-teal-600',
    navRailContainerBg: 'bg-teal-100 dark:bg-teal-800', navRailIconColor: 'text-teal-600 dark:text-teal-300', navRailTextColor: 'text-teal-700 dark:text-teal-200',
    listItemSelectedBg: 'bg-teal-100 dark:bg-teal-700', listItemSelectedText: 'text-teal-800 dark:text-teal-100', listItemHoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-600'
  },
   {
    id: 'nutribase', name: 'NutriBase', icon: BeakerIcon, baseColorClass: 'sky', 
    bgColor: 'bg-sky-600 dark:bg-sky-500', textColor: 'text-white', hoverBgColor: 'hover:bg-sky-700 dark:hover:bg-sky-600',
    navRailContainerBg: 'bg-sky-100 dark:bg-sky-800', navRailIconColor: 'text-sky-600 dark:text-sky-300', navRailTextColor: 'text-sky-700 dark:text-sky-200',
    listItemSelectedBg: 'bg-sky-100 dark:bg-sky-700', listItemSelectedText: 'text-sky-800 dark:text-sky-100', listItemHoverBg: 'hover:bg-sky-50 dark:hover:bg-sky-600'
  },
  {
    id: 'compostcorner', name: 'Compost', icon: CubeTransparentIcon, baseColorClass: 'yellow', 
    bgColor: 'bg-yellow-500 dark:bg-yellow-400', textColor: 'text-neutral-900', hoverBgColor: 'hover:bg-yellow-600 dark:hover:bg-yellow-500',
    navRailContainerBg: 'bg-yellow-100 dark:bg-yellow-800', navRailIconColor: 'text-yellow-600 dark:text-yellow-300', navRailTextColor: 'text-yellow-700 dark:text-yellow-200',
    listItemSelectedBg: 'bg-yellow-100 dark:bg-yellow-700', listItemSelectedText: 'text-yellow-800 dark:text-yellow-100', listItemHoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-600'
  }
];
