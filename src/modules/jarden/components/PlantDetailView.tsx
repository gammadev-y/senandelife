
import React, { useState, useRef, Fragment, useEffect } from 'react';
import {
  Plant, PlantCalendarTaskType,
  PlantIdentificationOverview, KeyFeaturesUsesGeneral, CultivationGrowingConditions,
  PlantNutritionFertilizationNeeds, PlantCareMaintenance, EcologicalInteractions,
  FruitingHarvestingConditional, UseCasesHumanSymbiosis, SeedSavingStorageDetails,
  UserSourcingInformation, ToxicityDetail, PhaseSpecificFertilization,
  PestInteractionItem, DiseaseSusceptibilityItem, CompanionPlantingItem,
  AnnualCareCalendarTimelineSummaryItem, CulinaryUseItem, PreservationConservationTechnique,
  AlternativeProductUseItem, MedicinalUseItem, RawPlantDataFromAI, GrowthStageTimelinesDaysFromSowing, LightRequirementsGeneral, WaterRequirementsGeneral, SoilRequirementsGeneral, EnvironmentalTolerancesDetailed,
  PlantSectionKeyForAI, RawPlantSectionDataFromAI,
  GrowthStageTimelineEntry, TextRange, SoilPHRangeOverall, AirTemperatureCelsius, RelativeHumidityPercentage, LightIntensityLux, PlacementSpacing, PruningShaping, RepottingForContainerPlants, PropagationMethodsSummary, SeedPropagationDetails, CuttingPropagationDetails, GraftingPropagationDetails, PestInteractions, DiseaseSusceptibility, PestDiseaseManagementSpecificStrategies, CompanionPlanting, PollinatorsWildlifeInteraction, FloweringPollinationForFruitSet, FruitVegetableDevelopmentEnhancement, HarvestingDetails, SeedSavingHarvestingGuide, OptimalSeedStorageConditions, InformationSourceItem, AIQueryLog
} from '../types';
import { MODULES, MONTH_ABBREVIATIONS, PLANT_TASK_TYPE_ICONS } from '../constants';
import EditableText from './EditableText'; 
import LoadingSpinner from './LoadingSpinner';
import { getAiAssistedDataForPlantSection, generatePlantImageWithAi } from '../services/geminiService';
import { convertFileToBase64 } from '../utils/imageUtils';
import { produce } from 'immer';
import PlantStockIcon from './icons/PlantStockIcon';
import { deepMerge, isObject } from '../utils/objectUtils';


import {
  ArrowLeftIcon, BeakerIcon, CalendarDaysIcon, ChatBubbleBottomCenterTextIcon, CogIcon, DocumentTextIcon, FireIcon, GlobeAltIcon, HeartIcon, InboxStackIcon, InformationCircleIcon, LifebuoyIcon, LightBulbIcon, ListBulletIcon, MapPinIcon, ScaleIcon, SunIcon, TagIcon, UserCircleIcon, WrenchScrewdriverIcon, EyeIcon, AcademicCapIcon, ArchiveBoxIcon, VariableIcon, CloudIcon, ShieldCheckIcon, BugAntIcon, CubeTransparentIcon, UserGroupIcon, PencilIcon, CommandLineIcon, ChevronDownIcon, ArrowsPointingOutIcon, CalendarIcon as CalendarOutlineIcon, SparklesIcon as OutlineSparklesIcon, ChevronLeftIcon as ChevronLeftIconOutline, CheckIcon, ExclamationTriangleIcon, ChevronUpIcon, MinusIcon, PlusIcon, BookOpenIcon, CircleStackIcon, PaintBrushIcon, LinkIcon, ShieldExclamationIcon, ReceiptPercentIcon, StarIcon, AcademicCapIcon as CultivationIcon, ChatBubbleLeftRightIcon as RelatedIcon, ChevronRightIcon, ClockIcon, ClipboardDocumentListIcon, XMarkIcon, PhotoIcon, CodeBracketIcon, UsersIcon, CubeIcon, GiftIcon, PuzzlePieceIcon, ArrowPathIcon
} from '@heroicons/react/24/outline'; 

interface PlantDetailViewProps {
  plant: Plant | null;
  onUpdatePlant: (plantId: string, updatedData: Partial<Plant>, updatedFromSection?: PlantSectionKeyForAI) => void;
  isLoadingAi: boolean; // General loading for full AI fill
  setIsLoadingAi: (loading: boolean) => void;
  setAppError: (error: string | null) => void;
  onOpenCustomAiPromptModal: (data: { plantId: string, plantName: string, sectionKey?: PlantSectionKeyForAI }) => void;
  onPopulateWithStandardAI: (plantId: string) => void;
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
}

const DetailSection: React.FC<{
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  isEditing: boolean;
  isLoadingSectionAi: boolean;
  onAiFillSection?: () => void;
  sectionKeyForAi?: PlantSectionKeyForAI;
  defaultOpen?: boolean;
}> = ({ title, children, icon: Icon, isEditing, isLoadingSectionAi, onAiFillSection, sectionKeyForAi, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
  <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl"> {/* Changed neutral to slate */}
    <div 
        className="flex items-center justify-between p-4 md:p-5 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center">
        {Icon && <Icon className={`w-6 h-6 mr-3 text-slate-600 dark:text-slate-300`} />} {/* Changed neutral to slate */}
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3> {/* Changed neutral to slate */}
      </div>
      <div className="flex items-center">
        {isEditing && sectionKeyForAi && onAiFillSection && (
            <button
            onClick={(e) => { e.stopPropagation(); onAiFillSection(); }} // Stop propagation to prevent toggle
            disabled={isLoadingSectionAi}
            title={`AI Fill ${title} Section`}
            className="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700 rounded-full transition-colors mr-2"
            >
            {isLoadingSectionAi ? <LoadingSpinner size="sm" color="text-sky-500" /> : <OutlineSparklesIcon className="w-5 h-5" />}
            </button>
        )}
        {isOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />} {/* Changed neutral to slate */}
      </div>
    </div>
    {isOpen && (
        <div id={`section-content-${title.replace(/\s+/g, '-')}`} className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed prose prose-sm dark:prose-invert max-w-none"> {/* Changed neutral to slate */}
            {children}
        </div>
    )}
  </div>
  );
};

const ArrayDisplay: React.FC<{ items: string[] | undefined | null; labelText?: string; path?: string; onSave?: (path:string, value: any) => void; isEditing?: boolean; placeholder?: string }> = ({ items, labelText, path, onSave, isEditing, placeholder="Not specified" }) => {
    if (!items || items.length === 0) {
        return <EditableText currentValue="" onSave={(val) => onSave && path && onSave(path, val.split(',').map(s => s.trim()).filter(s => s))} labelText={labelText} disabled={!isEditing} placeholder={placeholder} textSize="text-sm" />;
    }
    if (isEditing && path && onSave) {
        return <EditableText currentValue={items.join(', ')} onSave={(val) => onSave(path, val.split(',').map(s => s.trim()).filter(s => s))} labelText={labelText} textarea disabled={false} placeholder={placeholder} textSize="text-sm" />;
    }
    return (
        <div>
            {labelText && <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">{labelText}</p>} {/* Changed neutral to slate */}
            <ul className="list-disc list-inside pl-1 space-y-0.5">
                {items.map((item, index) => <li key={index} className="text-sm">{item}</li>)}
            </ul>
        </div>
    );
};


const PlantDetailView: React.FC<PlantDetailViewProps> = ({
  plant, onUpdatePlant, isLoadingAi, setIsLoadingAi, setAppError,
  onOpenCustomAiPromptModal, onPopulateWithStandardAI, moduleConfig, onDeselect, isCompactView
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlantData, setEditedPlantData] = useState<Partial<Plant> | null>(null);
  const [isLoadingSectionAi, setIsLoadingSectionAi] = useState<PlantSectionKeyForAI | null>(null);
  const [isLoadingAiImage, setIsLoadingAiImage] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [showStockIcon, setShowStockIcon] = useState(false);
  const [imageObjectPositionY, setImageObjectPositionY] = useState(plant?.image_object_position_y || 50);


  useEffect(() => {
    if (plant && isEditing) {
      setEditedPlantData(JSON.parse(JSON.stringify(plant))); 
      setImageObjectPositionY(plant.image_object_position_y || 50);
    } else {
      setEditedPlantData(null);
      if (plant) {
        setImageObjectPositionY(plant.image_object_position_y || 50);
      }
    }
  }, [plant, isEditing]);

  useEffect(() => {
    if (plant?.display_image_url) {
      setShowStockIcon(false);
    } else {
      setShowStockIcon(true);
    }
    setImageObjectPositionY(plant?.image_object_position_y || 50);
  }, [plant?.display_image_url, plant?.image_object_position_y]);


  const currentDisplayPlant = isEditing && editedPlantData ? editedPlantData as Plant : plant;
  const currentImageObjectPositionY = isEditing ? imageObjectPositionY : (plant?.image_object_position_y || 50);


  if (!currentDisplayPlant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 dark:bg-slate-900"> {/* Changed neutral to slate */}
        <SunIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">FloraPedia</h2> {/* Changed neutral to slate */}
        <p className="text-lg text-slate-500 dark:text-slate-400">Select a plant from the list to view its details.</p> {/* Changed neutral to slate */}
      </div>
    );
  }

  const handleSaveField = (path: string, value: any) => {
    if (!isEditing || !editedPlantData) return;
  
    setEditedPlantData(produce(draft => {
      let current = draft as any;
      const keys = path.split('.');
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = value;
        } else {
          if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {}; 
          }
          current = current[key];
        }
      });
    }));
  };
  
  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentDisplayPlant) {
      try {
        setAppError(null);
        const base64 = await convertFileToBase64(file);
        if (isEditing && editedPlantData) { 
          setEditedPlantData(prev => ({ ...prev, display_image_url: base64, image_object_position_y: 50 }) as Plant);
          setImageObjectPositionY(50);
          setShowStockIcon(false);
        } else if (!isEditing) { 
          onUpdatePlant(currentDisplayPlant.id, { display_image_url: base64, image_object_position_y: 50 });
        }
      } catch (err) {
        console.error("Error converting file to base64:", err);
        setAppError("Failed to update image. Please try another file.");
      }
    }
  };

  const handleSaveChanges = () => {
    if (plant && editedPlantData) {
      const dataToSave = produce(editedPlantData, draft => {
        draft.image_object_position_y = imageObjectPositionY;
      });
      onUpdatePlant(plant.id, dataToSave);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPlantData(null); 
    setImageObjectPositionY(plant?.image_object_position_y || 50);
    if (plant?.display_image_url) {
      setShowStockIcon(false);
    } else {
      setShowStockIcon(true);
    }
  };
  
  const handleAiFillSection = async (sectionKey: PlantSectionKeyForAI) => {
    if (!plant) return;
    setIsLoadingSectionAi(sectionKey);
    setAppError(null);
    try {
      const aiSectionDataWrapper = await getAiAssistedDataForPlantSection(plant.plant_identification_overview.common_names[0] || 'Plant', sectionKey, plant);
      
      setEditedPlantData(produce((draft: Plant | null) => {
        if (draft && aiSectionDataWrapper && (aiSectionDataWrapper as any)[sectionKey]) { 
            const currentSectionInDraft = (draft as Record<string, any>)[sectionKey];
            const aiProvidedDataForSection = (aiSectionDataWrapper as Record<string, any>)[sectionKey];

            if (isObject(currentSectionInDraft) && isObject(aiProvidedDataForSection)) {
                (draft as Record<string, any>)[sectionKey] = deepMerge(currentSectionInDraft, aiProvidedDataForSection);
            } else {
                (draft as Record<string, any>)[sectionKey] = aiProvidedDataForSection;
            }
        }
      }));

    } catch (err) {
      console.error(`Error AI filling section ${sectionKey}:`, err);
      setAppError(err instanceof Error ? err.message : `Failed to AI fill ${sectionKey}.`);
    } finally {
      setIsLoadingSectionAi(null);
    }
  };
  
  const handleAiGenerateImage = async () => {
    if (!currentDisplayPlant) return;
    const plantNameForPrompt = currentDisplayPlant.plant_identification_overview.common_names[0] || currentDisplayPlant.plant_identification_overview.latin_name_scientific_name || 'Plant';
    setIsLoadingAiImage(true);
    setAppError(null);
    try {
      const generatedBase64Image = await generatePlantImageWithAi(plantNameForPrompt);
      if (generatedBase64Image) {
        if (isEditing && editedPlantData) {
          setEditedPlantData(prev => ({ ...prev, display_image_url: generatedBase64Image, image_object_position_y: 50 }) as Plant);
          setImageObjectPositionY(50);
          setShowStockIcon(false);
        }
      } else {
        setAppError("AI image generation did not return an image.");
      }
    } catch (err) {
      console.error("Error generating plant image with AI:", err);
      setAppError(err instanceof Error ? err.message : "Failed to generate image with AI.");
    } finally {
      setIsLoadingAiImage(false);
    }
  };

  const handleImagePositionChange = (direction: 'up' | 'down' | 'reset') => {
    if (!isEditing) return;
    let newPosition = imageObjectPositionY;
    const step = 5;
    if (direction === 'up') {
        newPosition = Math.max(0, imageObjectPositionY - step);
    } else if (direction === 'down') {
        newPosition = Math.min(100, imageObjectPositionY + step);
    } else if (direction === 'reset') {
        newPosition = 50;
    }
    setImageObjectPositionY(newPosition);
    setEditedPlantData(produce(draft => {
        if(draft) draft.image_object_position_y = newPosition;
    }));
  };


  const {
    plant_identification_overview: idOverview,
    cultivation_growing_conditions: cultConditions,
    key_features_uses_general: keyFeatures,
    plant_nutrition_fertilization_needs: nutritionNeeds,
    plant_care_maintenance: careMaintenance,
    growth_stage_timelines_days_from_sowing: growthTimelines,
    ecological_interactions: ecoInteractions,
    fruiting_harvesting_conditional: fruitingHarvesting,
    annual_care_calendar_timeline_summary: annualCare,
    use_cases_human_symbiosis: useCases,
    seed_saving_storage_details: seedSaving,
    user_sourcing_information: sourcingInfo,
  } = currentDisplayPlant;

  const commonName = idOverview.common_names[0] || 'Unnamed Plant';
  const heroImageUrl = currentDisplayPlant.display_image_url;

  const renderTextRange = (labelText: string, range: TextRange | undefined, path: string) => (
    <EditableText currentValue={range?.text_range || ''} onSave={val => handleSaveField(`${path}.text_range`, val)} labelText={labelText} disabled={!isEditing} textSize="text-sm" />
  );
  const renderToxicityDetail = (labelText: string, detail: ToxicityDetail | undefined, path: string) => (
    <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">{labelText}</p> {/* Changed neutral to slate */}
        <EditableText currentValue={detail?.level || 'Unknown'} onSave={val => handleSaveField(`${path}.level`, val)} labelText="Level" disabled={!isEditing} textSize="text-sm" />
        <EditableText currentValue={detail?.details || ''} onSave={val => handleSaveField(`${path}.details`, val)} labelText="Details" textarea disabled={!isEditing} textSize="text-sm" />
    </div>
  );
  const renderKeyValueObject = (obj: Record<string, any> | undefined | null, basePath: string, title?: string) => {
    if (!obj) return <p className="text-xs">Not specified.</p>;
    return (
        <div>
            {title && <h5 className="text-xs font-semibold mt-2 mb-1">{title}</h5>}
            {Object.entries(obj).map(([key, value]) => (
                typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                    <div key={key} className="ml-2">
                        {renderKeyValueObject(value as Record<string, any>, `${basePath}.${key}`, key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}
                    </div>
                ) : (
                <EditableText
                    key={key}
                    currentValue={value !== null && value !== undefined ? String(value) : ''}
                    onSave={val => handleSaveField(`${basePath}.${key}`, val)}
                    labelText={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    disabled={!isEditing}
                    textSize="text-sm"
                />
                )
            ))}
        </div>
    );
  };


  return (
    <div className="h-full bg-slate-100 dark:bg-slate-900 overflow-y-auto custom-scrollbar"> {/* Changed neutral to slate */}
      <div className="relative">
        <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageFileChange} className="hidden" id={`plantImageUpload-${currentDisplayPlant.id}`} />
        
        <div className="w-full h-64 md:h-80 relative group/imgcontrol">
          {!showStockIcon && heroImageUrl && (
            <img
              src={heroImageUrl}
              alt={commonName}
              className="w-full h-full object-cover"
              style={{ objectPosition: `50% ${currentImageObjectPositionY}%` }}
              onError={() => setShowStockIcon(true)}
            />
          )}
          {showStockIcon && (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700"> {/* Changed neutral to slate */}
              <PlantStockIcon className={`w-32 h-32 text-${moduleConfig.baseColorClass}-400 dark:text-${moduleConfig.baseColorClass}-500`} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          {isEditing && heroImageUrl && !showStockIcon && (
             <div className="absolute top-1/2 -translate-y-1/2 right-4 z-30 flex flex-col space-y-2 opacity-0 group-hover/imgcontrol:opacity-100 transition-opacity duration-200">
                <button onClick={() => handleImagePositionChange('up')} title="Move image up" className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-md"><ChevronUpIcon className="w-5 h-5"/></button>
                <button onClick={() => handleImagePositionChange('reset')} title="Reset image position" className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-md"><ArrowPathIcon className="w-5 h-5"/></button>
                <button onClick={() => handleImagePositionChange('down')} title="Move image down" className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-md"><ChevronDownIcon className="w-5 h-5"/></button>
             </div>
          )}
        </div>

        
        {onDeselect && !isEditing && (
          <button onClick={onDeselect} className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10" aria-label="Back to plant list">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        )}

        <div className="absolute top-4 right-4 z-20">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg transition-all" aria-label="Edit plant details">
              <PencilIcon className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex space-x-2">
              <button onClick={handleSaveChanges} className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-all" aria-label="Save changes"> {/* Changed to emerald */}
                <CheckIcon className="w-5 h-5" />
              </button>
              <button onClick={handleCancelEdit} className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all" aria-label="Cancel edit">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="absolute bottom-4 right-4 z-20 flex space-x-2">
            <button
                onClick={handleAiGenerateImage}
                disabled={isLoadingAiImage}
                className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg transition-colors"
                aria-label="Generate image with AI"
                title="Generate image with AI"
            >
                {isLoadingAiImage ? <LoadingSpinner size="sm" color="text-white" /> : <OutlineSparklesIcon className="w-5 h-5" />}
            </button>
            <button
                onClick={() => imageInputRef.current?.click()}
                className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full shadow-lg transition-colors"
                aria-label="Change plant image"
                title="Change plant image"
            >
                <PhotoIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <EditableText currentValue={commonName} onSave={val => handleSaveField('plant_identification_overview.common_names.0', val)} labelText="" textClassName="text-3xl md:text-4xl font-bold text-white shadow-lg" inputFieldClass="text-3xl md:text-4xl font-bold" disabled={!isEditing} />
          {idOverview.latin_name_scientific_name && (
            <EditableText currentValue={idOverview.latin_name_scientific_name} onSave={val => handleSaveField('plant_identification_overview.latin_name_scientific_name', val)} labelText="" textClassName="text-md text-slate-200 italic" inputFieldClass="text-md italic" disabled={!isEditing} /> /* Changed neutral to slate */
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto pb-24">
        <DetailSection title="Identification Overview" icon={BookOpenIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'plant_identification_overview'} onAiFillSection={() => handleAiFillSection('plant_identification_overview')} sectionKeyForAi="plant_identification_overview">
          <EditableText currentValue={idOverview.description_brief} onSave={val => handleSaveField('plant_identification_overview.description_brief', val)} textarea disabled={!isEditing} placeholder="Detailed description..." labelText="Brief Overview" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs mt-3">
            <EditableText currentValue={idOverview.plant_family} onSave={val => handleSaveField('plant_identification_overview.plant_family', val)} labelText="Family" disabled={!isEditing} textSize="text-sm" />
            <EditableText currentValue={idOverview.plant_type_category} onSave={val => handleSaveField('plant_identification_overview.plant_type_category', val)} labelText="Type/Category" disabled={!isEditing} textSize="text-sm" />
            <EditableText currentValue={idOverview.growth_structure_habit} onSave={val => handleSaveField('plant_identification_overview.growth_structure_habit', val)} labelText="Habit" disabled={!isEditing} textSize="text-sm" />
            <EditableText currentValue={idOverview.life_cycle} onSave={val => handleSaveField('plant_identification_overview.life_cycle', val)} labelText="Life Cycle" disabled={!isEditing} textSize="text-sm" />
            {renderTextRange("Mature Height", idOverview.expected_mature_height_meters, 'plant_identification_overview.expected_mature_height_meters')}
            {renderTextRange("Mature Spread", idOverview.expected_mature_spread_width_meters, 'plant_identification_overview.expected_mature_spread_width_meters')}
            <EditableText currentValue={idOverview.hardiness_zones?.usda || ''} onSave={val => handleSaveField('plant_identification_overview.hardiness_zones.usda', val)} labelText="Hardiness (USDA)" disabled={!isEditing} textSize="text-sm" />
            <EditableText currentValue={idOverview.hardiness_zones?.rhs || ''} onSave={val => handleSaveField('plant_identification_overview.hardiness_zones.rhs', val)} labelText="Hardiness (RHS)" disabled={!isEditing} textSize="text-sm" />
            <EditableText currentValue={idOverview.cultivar_variety || ''} onSave={val => handleSaveField('plant_identification_overview.cultivar_variety', val)} labelText="Cultivar/Variety" disabled={!isEditing} textSize="text-sm" />
            <ArrayDisplay items={idOverview.native_regions} labelText="Native Regions" path="plant_identification_overview.native_regions" onSave={handleSaveField} isEditing={isEditing} />
          </div>
        </DetailSection>

        <DetailSection title="Key Features & Uses" icon={TagIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'key_features_uses_general'} onAiFillSection={() => handleAiFillSection('key_features_uses_general')} sectionKeyForAi="key_features_uses_general">
            <ArrayDisplay items={keyFeatures.primary_uses} labelText="Primary Uses" path="key_features_uses_general.primary_uses" onSave={handleSaveField} isEditing={isEditing} />
            <ArrayDisplay items={keyFeatures.special_distinguishing_features} labelText="Special Features" path="key_features_uses_general.special_distinguishing_features" onSave={handleSaveField} isEditing={isEditing} />
            <h4 className="text-sm font-semibold mt-3 mb-1">Toxicity Information</h4>
            {renderToxicityDetail("Human Toxicity", keyFeatures.toxicity_information?.human_toxicity, 'key_features_uses_general.toxicity_information.human_toxicity')}
            {renderToxicityDetail("Dog Toxicity", keyFeatures.toxicity_information?.dog_toxicity, 'key_features_uses_general.toxicity_information.dog_toxicity')}
            {renderToxicityDetail("Cat Toxicity", keyFeatures.toxicity_information?.cat_toxicity, 'key_features_uses_general.toxicity_information.cat_toxicity')}
            <EditableText currentValue={keyFeatures.toxicity_information?.other_animal_toxicity_specify || ''} onSave={val => handleSaveField('key_features_uses_general.toxicity_information.other_animal_toxicity_specify', val)} labelText="Other Animal Toxicity" textarea disabled={!isEditing} textSize="text-sm" />
        </DetailSection>

        <DetailSection title="Cultivation & Growing Conditions" icon={CultivationIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'cultivation_growing_conditions'} onAiFillSection={() => handleAiFillSection('cultivation_growing_conditions')} sectionKeyForAi="cultivation_growing_conditions" defaultOpen={false}>
            <h4 className="text-sm font-semibold mb-1">General Light</h4>
            {renderKeyValueObject(cultConditions.light_requirements_general, 'cultivation_growing_conditions.light_requirements_general')}
            <h4 className="text-sm font-semibold mt-3 mb-1">General Water</h4>
            {renderKeyValueObject(cultConditions.water_requirements_general, 'cultivation_growing_conditions.water_requirements_general')}
            <h4 className="text-sm font-semibold mt-3 mb-1">General Soil</h4>
            {renderKeyValueObject(cultConditions.soil_requirements_general, 'cultivation_growing_conditions.soil_requirements_general')}
            <h4 className="text-sm font-semibold mt-3 mb-1">Environmental Tolerances (Detailed)</h4>
            {renderKeyValueObject(cultConditions.environmental_tolerances_detailed, 'cultivation_growing_conditions.environmental_tolerances_detailed')}
        </DetailSection>
        
        <DetailSection title="Nutrition & Fertilization" icon={BeakerIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'plant_nutrition_fertilization_needs'} onAiFillSection={() => handleAiFillSection('plant_nutrition_fertilization_needs')} sectionKeyForAi="plant_nutrition_fertilization_needs" defaultOpen={false}>
            <EditableText currentValue={nutritionNeeds.general_fertilizer_preferences || ''} onSave={val => handleSaveField('plant_nutrition_fertilization_needs.general_fertilizer_preferences', val)} labelText="General Preferences" disabled={!isEditing} textarea />
            <h4 className="text-sm font-semibold mt-3 mb-1">Phase-Specific Fertilization Needs</h4>
            {nutritionNeeds.phase_specific_fertilization_needs?.length > 0 ? nutritionNeeds.phase_specific_fertilization_needs.map((phase, index) => (
                <div key={index} className="p-2 border-l-2 border-slate-300 dark:border-slate-600 ml-1 pl-3 mb-2"> {/* Changed neutral to slate */}
                    {renderKeyValueObject(phase, `plant_nutrition_fertilization_needs.phase_specific_fertilization_needs.${index}`)}
                </div>
            )) : <p className="text-xs">Not specified.</p>}
        </DetailSection>

        <DetailSection title="Care & Maintenance" icon={WrenchScrewdriverIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'plant_care_maintenance'} onAiFillSection={() => handleAiFillSection('plant_care_maintenance')} sectionKeyForAi="plant_care_maintenance" defaultOpen={false}>
            <h4 className="text-sm font-semibold mb-1">Pruning & Shaping</h4>
            {renderKeyValueObject(careMaintenance.pruning_shaping, 'plant_care_maintenance.pruning_shaping')}
            <h4 className="text-sm font-semibold mt-3 mb-1">Repotting (Container Plants)</h4>
            {careMaintenance.repotting_for_container_plants ? renderKeyValueObject(careMaintenance.repotting_for_container_plants, 'plant_care_maintenance.repotting_for_container_plants') : <p className="text-xs">Not typically container grown or not specified.</p>}
            <ArrayDisplay items={careMaintenance.root_strengthening_techniques} labelText="Root Strengthening Techniques" path="plant_care_maintenance.root_strengthening_techniques" onSave={handleSaveField} isEditing={isEditing} />
            <h4 className="text-sm font-semibold mt-3 mb-1">Propagation Methods Summary</h4>
            <ArrayDisplay items={careMaintenance.propagation_methods_summary?.primary_methods} labelText="Primary Methods" path="plant_care_maintenance.propagation_methods_summary.primary_methods" onSave={handleSaveField} isEditing={isEditing} />
            {/* TODO: Add detailed display for seed, cutting, grafting propagation if applicable */}
        </DetailSection>
        
        <DetailSection title="Growth Stage Timelines (from Sowing)" icon={ClockIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'growth_stage_timelines_days_from_sowing'} onAiFillSection={() => handleAiFillSection('growth_stage_timelines_days_from_sowing')} sectionKeyForAi="growth_stage_timelines_days_from_sowing" defaultOpen={false}>
            {growthTimelines ? renderKeyValueObject(growthTimelines, 'growth_stage_timelines_days_from_sowing') : <p className="text-xs">Not specified.</p>}
        </DetailSection>

        <DetailSection title="Ecological Interactions" icon={BugAntIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'ecological_interactions'} onAiFillSection={() => handleAiFillSection('ecological_interactions')} sectionKeyForAi="ecological_interactions" defaultOpen={false}>
            {ecoInteractions ? (
                <>
                    {renderKeyValueObject(ecoInteractions.pest_interactions, 'ecological_interactions.pest_interactions', "Pest Interactions")}
                    {renderKeyValueObject(ecoInteractions.disease_susceptibility, 'ecological_interactions.disease_susceptibility', "Disease Susceptibility")}
                    {renderKeyValueObject(ecoInteractions.pest_disease_management_specific_strategies, 'ecological_interactions.pest_disease_management_specific_strategies', "Management Strategies")}
                    {renderKeyValueObject(ecoInteractions.companion_planting, 'ecological_interactions.companion_planting', "Companion Planting")}
                    {renderKeyValueObject(ecoInteractions.pollinators_wildlife_interaction, 'ecological_interactions.pollinators_wildlife_interaction', "Pollinators & Wildlife")}
                </>
            ) : <p className="text-xs">Not specified.</p>}
        </DetailSection>
        
        {fruitingHarvesting?.is_applicable && (
        <DetailSection title="Fruiting & Harvesting" icon={StarIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'fruiting_harvesting_conditional'} onAiFillSection={() => handleAiFillSection('fruiting_harvesting_conditional')} sectionKeyForAi="fruiting_harvesting_conditional" defaultOpen={false}>
            {renderKeyValueObject(fruitingHarvesting.flowering_pollination_for_fruit_set, 'fruiting_harvesting_conditional.flowering_pollination_for_fruit_set', 'Flowering & Pollination')}
            {renderKeyValueObject(fruitingHarvesting.fruit_vegetable_development_enhancement, 'fruiting_harvesting_conditional.fruit_vegetable_development_enhancement', 'Development Enhancement')}
            {renderKeyValueObject(fruitingHarvesting.harvesting_details, 'fruiting_harvesting_conditional.harvesting_details', 'Harvesting Details')}
        </DetailSection>
        )}

        <DetailSection title="Annual Care Calendar Summary" icon={CalendarDaysIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'annual_care_calendar_timeline_summary'} onAiFillSection={() => handleAiFillSection('annual_care_calendar_timeline_summary')} sectionKeyForAi="annual_care_calendar_timeline_summary" defaultOpen={false}>
            {annualCare?.length > 0 ? annualCare.map((item, index) => (
                <div key={index} className="p-2 border-l-2 border-slate-300 dark:border-slate-600 ml-1 pl-3 mb-2"> {/* Changed neutral to slate */}
                    {renderKeyValueObject(item, `annual_care_calendar_timeline_summary.${index}`)}
                </div>
            )) : <p className="text-xs">No annual care summary provided.</p>}
        </DetailSection>

        <DetailSection title="Use Cases & Human Symbiosis" icon={GiftIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'use_cases_human_symbiosis'} onAiFillSection={() => handleAiFillSection('use_cases_human_symbiosis')} sectionKeyForAi="use_cases_human_symbiosis" defaultOpen={false}>
            {useCases ? (
                <>
                    <h4 className="text-sm font-semibold mt-2 mb-1">Culinary Uses</h4>
                    {useCases.culinary_uses?.length > 0 ? useCases.culinary_uses.map((item, index) => <div key={index} className="ml-2 pl-2 border-l mb-1">{renderKeyValueObject(item, `use_cases_human_symbiosis.culinary_uses.${index}`)}</div>) : <p className="text-xs">Not specified.</p>}
                    
                    <h4 className="text-sm font-semibold mt-3 mb-1">Preservation Techniques</h4>
                    {useCases.preservation_conservation_techniques_for_plant?.length > 0 ? useCases.preservation_conservation_techniques_for_plant.map((item, index) => <div key={index} className="ml-2 pl-2 border-l mb-1">{renderKeyValueObject(item, `use_cases_human_symbiosis.preservation_conservation_techniques_for_plant.${index}`)}</div>) : <p className="text-xs">Not specified.</p>}
                    
                    <h4 className="text-sm font-semibold mt-3 mb-1">Alternative Products/Uses</h4>
                    {useCases.alternative_products_uses?.length > 0 ? useCases.alternative_products_uses.map((item, index) => <div key={index} className="ml-2 pl-2 border-l mb-1">{renderKeyValueObject(item, `use_cases_human_symbiosis.alternative_products_uses.${index}`)}</div>) : <p className="text-xs">Not specified.</p>}
                    
                    <h4 className="text-sm font-semibold mt-3 mb-1">Medicinal Uses (Traditional/Folk)</h4>
                    {useCases.medicinal_uses_traditional_folk?.length > 0 ? useCases.medicinal_uses_traditional_folk.map((item, index) => <div key={index} className="ml-2 pl-2 border-l mb-1">{renderKeyValueObject(item, `use_cases_human_symbiosis.medicinal_uses_traditional_folk.${index}`)}</div>) : <p className="text-xs">Not specified.</p>}
                    
                    <ArrayDisplay items={useCases.other_craft_material_uses} labelText="Other Craft/Material Uses" path="use_cases_human_symbiosis.other_craft_material_uses" onSave={handleSaveField} isEditing={isEditing} />
                </>
            ): <p className="text-xs">Not specified.</p>}
        </DetailSection>

        <DetailSection title="Seed Saving & Storage" icon={CircleStackIcon} isEditing={isEditing} isLoadingSectionAi={isLoadingSectionAi === 'seed_saving_storage_details'} onAiFillSection={() => handleAiFillSection('seed_saving_storage_details')} sectionKeyForAi="seed_saving_storage_details" defaultOpen={false}>
            {seedSaving ? renderKeyValueObject(seedSaving, 'seed_saving_storage_details') : <p className="text-xs">Not specified.</p>}
        </DetailSection>

        <DetailSection title="Sourcing Information" icon={InformationCircleIcon} isEditing={isEditing} isLoadingSectionAi={false} defaultOpen={false}>
            {sourcingInfo ? (
                <>
                    <EditableText currentValue={sourcingInfo.user_notes || ''} onSave={val => handleSaveField('user_sourcing_information.user_notes', val)} labelText="User Notes" textarea disabled={!isEditing} textSize="text-sm" />
                    <EditableText currentValue={new Date(sourcingInfo.date_record_created).toLocaleString()} onSave={_ => {}} labelText="Date Created" disabled={true} textSize="text-sm" />
                    <EditableText currentValue={new Date(sourcingInfo.date_record_last_modified).toLocaleString()} onSave={_ => {}} labelText="Last Modified" disabled={true} textSize="text-sm" />
                    <h4 className="text-sm font-semibold mt-3 mb-1">Information Sources</h4>
                    {sourcingInfo.information_sources?.length > 0 ? sourcingInfo.information_sources.map((item, index) => <div key={index} className="ml-2 pl-2 border-l mb-1">{renderKeyValueObject(item, `user_sourcing_information.information_sources.${index}`)}</div>) : <p className="text-xs">Not specified.</p>}
                    {sourcingInfo.ai_query_log_if_applicable && (
                        <>
                         <h4 className="text-sm font-semibold mt-3 mb-1">AI Query Log</h4>
                         {renderKeyValueObject(sourcingInfo.ai_query_log_if_applicable, 'user_sourcing_information.ai_query_log_if_applicable')}
                        </>
                    )}
                </>
            ) : <p className="text-xs">Not specified.</p>}
        </DetailSection>


         <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center p-3 items-center">
              <button onClick={() => onPopulateWithStandardAI(plant.id)} disabled={isLoadingAi || isEditing} title="Populate with AI (Standard)" className={`flex items-center justify-center px-4 py-2 text-sm font-medium bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-200 rounded-full shadow-sm hover:bg-sky-200 dark:hover:bg-sky-600 transition-colors disabled:opacity-50`}>
                {isLoadingAi ? <LoadingSpinner size="sm" color="text-sky-600 dark:text-sky-300"/> : <OutlineSparklesIcon className="w-5 h-5 mr-1.5" />} AI Fill All Details
              </button>
              <button onClick={() => onOpenCustomAiPromptModal({ plantId: plant.id, plantName: commonName })} disabled={isLoadingAi || isEditing} title="Custom AI Prompt" className={`flex items-center justify-center px-4 py-2 text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-200 rounded-full shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50`}>
                <CommandLineIcon className="w-5 h-5 mr-1.5" /> Custom AI (All)
              </button>
               <button onClick={() => setIsJsonModalOpen(true)} disabled={isEditing} title="View Raw Plant Data" className={`flex items-center justify-center px-4 py-2 text-sm font-medium bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-full shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50`}> {/* Changed neutral to slate */}
                <CodeBracketIcon className="w-5 h-5 mr-1.5" /> View Raw Data
              </button>
          </div>
      </div>

      {isJsonModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={() => setIsJsonModalOpen(false)}>
          <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}> {/* Changed neutral to slate */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Raw JSON Data: {commonName}</h3> {/* Changed neutral to slate */}
              <button onClick={() => setIsJsonModalOpen(false)} className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"> {/* Changed neutral to slate */}
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-auto flex-grow custom-scrollbar bg-slate-100 dark:bg-slate-700 p-3 rounded-md"> {/* Changed neutral to slate */}
              <pre className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-all"> {/* Changed neutral to slate */}
                {JSON.stringify(currentDisplayPlant, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlantDetailView;