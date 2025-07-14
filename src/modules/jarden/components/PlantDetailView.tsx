
import React, { useState, useRef, useEffect } from 'react';
import { produce } from 'immer';
import { useAuth } from '../../../../context/AuthContext';
import { convertFileToBase64 } from '../utils/imageUtils';
import { generatePlantImageWithAi } from '../services/geminiService';
import {
  Plant, PlantSectionKeyForAI, CompanionPlantingItem,
} from '../types';
import { MODULES } from '../constants';
import EditableText from './EditableText';
import PlantStockIcon from './icons/PlantStockIcon';
import LoadingSpinner from './LoadingSpinner';

import {
  ArrowLeftIcon, GlobeAltIcon, HeartIcon, InformationCircleIcon,
  WrenchScrewdriverIcon, EyeIcon,
  CloudIcon, ShieldExclamationIcon, BugAntIcon, UserGroupIcon,
  PencilIcon, CheckIcon,
  ExclamationTriangleIcon, LinkIcon,
  SparklesIcon as OutlineSparklesIcon,
  UsersIcon, GiftIcon, PlusIcon, PhotoIcon, XMarkIcon, FireIcon
} from '@heroicons/react/24/outline';


// --- PROP TYPES ---
interface PlantDetailViewProps {
  plant: Plant | null;
  onUpdatePlant: (plantId: string, updatedData: Partial<Plant>, updatedFromSection?: PlantSectionKeyForAI) => void;
  isLoadingAi: boolean;
  setIsLoadingAi: (loading: boolean) => void;
  setAppError: (error: string | null) => void;
  onOpenCustomAiPromptModal: (data: { plantId: string, plantName: string, sectionKey?: PlantSectionKeyForAI }) => void;
  onPopulateWithStandardAI: (plantId: string) => void;
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
}

type ActiveTab = 'overview' | 'care' | 'ecology';

// --- HELPER & DATA DISPLAY COMPONENTS ---

const ArrayDisplay: React.FC<{
  items: string[];
  labelText: string;
  disabled: boolean;
  onSave: (items: string[]) => void;
  icon?: React.ElementType;
}> = ({ items, labelText, disabled, onSave, icon: Icon }) => {
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [editText, setEditText] = useState(items?.join(', ') || '');

  useEffect(() => {
    setEditText(items?.join(', ') || '');
  }, [items]);

  const handleLocalSave = () => {
    onSave(editText.split(',').map(s => s.trim()).filter(Boolean));
    setIsLocalEditing(false);
  };

  const handleCancel = () => {
    setEditText(items?.join(', ') || '');
    setIsLocalEditing(false);
  };
  
  if (disabled) {
    return (
      <div>
        <h4 className="font-semibold text-sm flex items-center mb-2">
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {labelText}
        </h4>
        {items && items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span key={i} className="px-2.5 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-200">{item}</span>
            ))}
          </div>
        ) : <p className="text-xs text-slate-500 italic">None specified</p>}
      </div>
    );
  }

  if (isLocalEditing) {
    return (
      <div>
        <h4 className="font-semibold text-sm flex items-center mb-2">
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {labelText}
        </h4>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          autoFocus
          className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-sm"
          rows={3}
          onBlur={(e) => { if (!e.relatedTarget || !['editable-save-button', 'editable-cancel-button'].includes((e.relatedTarget as HTMLElement).dataset.role || '')) { handleLocalSave(); } }}
        />
         <div className="mt-2.5 flex justify-end space-x-2">
          <button data-role="editable-cancel-button" onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-800 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400">Cancel</button>
          <button data-role="editable-save-button" onClick={handleLocalSave} className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-800 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer" onClick={() => setIsLocalEditing(true)}>
      <h4 className="font-semibold text-sm flex items-center mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {labelText}
      </h4>
      <div className="p-2 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700/60">
        {items && items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span key={i} className="px-2.5 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-200">{item}</span>
            ))}
          </div>
        ) : <p className="text-xs text-slate-500 italic">None specified</p>}
      </div>
    </div>
  );
};

const CompanionDisplay: React.FC<{ title: string; companions: CompanionPlantingItem[]; icon: string }> = ({ title, companions, icon }) => (
  <div>
    <h4 className="font-semibold text-sm flex items-center mb-2"><span className="mr-2">{icon}</span>{title}</h4>
    {companions && companions.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {companions.map((c, i) => (
          <span key={i} className="px-2.5 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-200" title={c.reason || ''}>{c.plant_name_or_id}</span>
        ))}
      </div>
    ) : <p className="text-xs text-slate-500 italic">None specified</p>}
  </div>
);

// --- MAIN COMPONENT ---

const PlantDetailView: React.FC<PlantDetailViewProps> = ({
  plant, onUpdatePlant, onDeselect, isCompactView, onPopulateWithStandardAI, moduleConfig, setAppError, setIsLoadingAi, isLoadingAi,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [editablePlant, setEditablePlant] = useState<Plant | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const prevPlantId = useRef<string | undefined>();

  useEffect(() => {
    // Only reset UI state if the actual plant changes
    if (plant?.id !== prevPlantId.current) {
        setActiveTab('overview');
        setIsEditing(false);
        setIsFabMenuOpen(false);
    }
    // Sync editable copy if not in edit mode
    if (!isEditing) {
        setEditablePlant(plant ? JSON.parse(JSON.stringify(plant)) : null);
    }
    prevPlantId.current = plant?.id;
  }, [plant, isEditing]);
  
  const handleFieldChange = (path: string, value: any) => {
    if (!editablePlant) return;
    setEditablePlant(produce(draft => {
        if (!draft) return;
        let current: any = draft;
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) {
            if (current[keys[i]] === undefined || current[keys[i]] === null) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }));
  };

  const handleSave = () => {
    if (plant && editablePlant) {
      onUpdatePlant(plant.id, editablePlant);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditablePlant(null); // This will cause useEffect to re-sync from prop
  };
  
  const handleAiGenerateImage = async () => {
    if (!plant) return;
    setAppError(null);
    setIsLoadingAi(true);
    try {
        const generatedBase64Image = await generatePlantImageWithAi(plant.plant_identification_overview.common_names[0] || 'plant');
        if (generatedBase64Image) {
            onUpdatePlant(plant.id, { display_image_url: generatedBase64Image, image_object_position_y: 50 });
        } else {
            setAppError("AI image generation did not return an image.");
        }
    } catch (err) {
        setAppError(err instanceof Error ? err.message : "Failed to generate image with AI.");
    } finally {
        setIsLoadingAi(false);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && plant) {
        try {
            const base64 = await convertFileToBase64(e.target.files[0]);
            onUpdatePlant(plant.id, { display_image_url: base64, image_object_position_y: 50 });
        } catch (err) {
            setAppError("Failed to upload image.");
        }
    }
  };
  
  const FabSystem = () => {
    if (!user || !plant) return null;
  
    if (isEditing) {
      return (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-30 flex gap-4">
          <button
            onClick={handleCancel}
            className="w-16 h-16 flex items-center justify-center bg-violet-200 text-violet-800 dark:bg-violet-300 dark:text-violet-900 rounded-2xl shadow-lg hover:bg-violet-300 dark:hover:bg-violet-400 transition-all"
            aria-label="Cancel"
          >
            <span className="text-2xl" role="img" aria-hidden="true">❌</span>
          </button>
          <button
            onClick={handleSave}
            className="w-16 h-16 flex items-center justify-center bg-violet-200 text-violet-800 dark:bg-violet-300 dark:text-violet-900 rounded-2xl shadow-lg hover:bg-violet-300 dark:hover:bg-violet-400 transition-all"
            aria-label="Save"
          >
            <span className="text-2xl" role="img" aria-hidden="true">✔️</span>
          </button>
        </div>
      );
    }
  
    return (
      <div className="fixed bottom-24 md:bottom-6 right-6 z-30 flex flex-col items-end gap-4">
        {isFabMenuOpen && (
          <div className="flex flex-col items-end gap-4">
            <button
              onClick={() => { setIsEditing(true); setIsFabMenuOpen(false); }}
              className="flex items-center gap-3 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-violet-200 dark:hover:bg-violet-300 transition-all"
            >
              <span className="font-medium text-sm">Edit</span>
              <span className="text-xl" role="img" aria-hidden="true">✏️</span>
            </button>
            <button
              onClick={() => { onPopulateWithStandardAI(plant.id); setIsFabMenuOpen(false); }}
              className="flex items-center gap-3 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-violet-200 dark:hover:bg-violet-300 transition-all"
            >
              <span className="font-medium text-sm">AI Fill</span>
              <span className="text-xl" role="img" aria-hidden="true">✨</span>
            </button>
            <button
              onClick={() => { handleAiGenerateImage(); setIsFabMenuOpen(false); }}
              className="flex items-center gap-3 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-violet-200 dark:hover:bg-violet-300 transition-all"
            >
              <span className="font-medium text-sm">AI Image</span>
              <span className="text-xl" role="img" aria-hidden="true">🤖</span>
            </button>
          </div>
        )}
        <button
          onClick={() => !isLoadingAi && setIsFabMenuOpen(!isFabMenuOpen)}
          disabled={isLoadingAi}
          className={`flex items-center justify-center bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition-all duration-200 ease-in-out disabled:bg-violet-400 disabled:cursor-not-allowed
                      ${isFabMenuOpen ? 'w-14 h-14 rounded-full' : 'w-16 h-16 rounded-2xl'}`}
          aria-label={isFabMenuOpen ? 'Close menu' : 'Open actions menu'}
          aria-expanded={isFabMenuOpen}
        >
          {isLoadingAi ? (
            <LoadingSpinner size="sm" color="text-white" />
          ) : (
             <span className="text-2xl transition-transform duration-300 ease-in-out">
              {isFabMenuOpen ? '✕' : '✨'}
            </span>
          )}
        </button>
      </div>
    );
  };


  if (!plant) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800">
        <PlantStockIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">FloraPedia</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">Select a plant to view its details.</p>
      </div>
    );
  }

  const currentPlant = editablePlant || plant;
  
  const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: '🧬 Overview' },
    { id: 'care', label: '🌿 Care' },
    { id: 'ecology', label: '🌍 Ecology' },
  ];

  const commonName = currentPlant.plant_identification_overview?.common_names[0] || 'Unnamed Plant';
  
  const renderTabContent = () => {
    const pio = currentPlant.plant_identification_overview;
    const kfug = currentPlant.key_features_uses_general;
    const cgc = currentPlant.cultivation_growing_conditions;
    const pcm = currentPlant.plant_care_maintenance;
    const ei = currentPlant.ecological_interactions;
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
             <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <EditableText currentValue={pio.description_brief} onSave={v => handleFieldChange('plant_identification_overview.description_brief', v)} disabled={!isEditing || !user} textarea labelText="Description" />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <EditableText labelText="Type" currentValue={pio.plant_type_category} onSave={v => handleFieldChange('plant_identification_overview.plant_type_category', v)} disabled={!isEditing || !user} textarea={false}/>
                  <EditableText labelText="Habit" currentValue={pio.growth_structure_habit} onSave={v => handleFieldChange('plant_identification_overview.growth_structure_habit', v)} disabled={!isEditing || !user} textarea={false}/>
                  <EditableText labelText="Life Cycle" currentValue={pio.life_cycle} onSave={v => handleFieldChange('plant_identification_overview.life_cycle', v)} disabled={!isEditing || !user} textarea={false}/>
                  <EditableText labelText="Cultivar" currentValue={pio.cultivar_variety || ''} onSave={v => handleFieldChange('plant_identification_overview.cultivar_variety', v)} disabled={!isEditing || !user} textarea={false}/>
                </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-3">
                 <h3 className="font-semibold text-lg flex items-center">📏 Dimensions & Hardiness</h3>
                 <EditableText currentValue={pio.expected_mature_height_meters.text_range} onSave={v => handleFieldChange('plant_identification_overview.expected_mature_height_meters.text_range', v)} disabled={!isEditing || !user} labelText="Mature Height" textarea={false} />
                 <EditableText currentValue={pio.expected_mature_spread_width_meters.text_range} onSave={v => handleFieldChange('plant_identification_overview.expected_mature_spread_width_meters.text_range', v)} disabled={!isEditing || !user} labelText="Mature Spread" textarea={false} />
                 <EditableText currentValue={pio.hardiness_zones.usda || ''} onSave={v => handleFieldChange('plant_identification_overview.hardiness_zones.usda', v)} disabled={!isEditing || !user} labelText="USDA Zone" textarea={false} />
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-3">
              <h3 className="font-semibold text-lg flex items-center">☣️ Toxicity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditableText labelText="Human" currentValue={kfug.toxicity_information.human_toxicity.level} onSave={v => handleFieldChange('key_features_uses_general.toxicity_information.human_toxicity.level', v)} disabled={!isEditing || !user} textarea={false} />
                    <EditableText labelText="Dog" currentValue={kfug.toxicity_information.dog_toxicity.level} onSave={v => handleFieldChange('key_features_uses_general.toxicity_information.dog_toxicity.level', v)} disabled={!isEditing || !user} textarea={false} />
                    <EditableText labelText="Cat" currentValue={kfug.toxicity_information.cat_toxicity.level} onSave={v => handleFieldChange('key_features_uses_general.toxicity_information.cat_toxicity.level', v)} disabled={!isEditing || !user} textarea={false} />
                </div>
            </div>
          </div>
        );
      case 'care':
         return (
             <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-3">
                    <h3 className="font-semibold text-lg flex items-center">🌱 Propagation</h3>
                    <p className="text-sm font-medium">Methods:</p>
                    <div className="flex gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${pcm.propagation_methods_summary.seed_propagation_details.is_applicable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Seed</span>
                        <span className={`px-2 py-1 rounded-full ${pcm.propagation_methods_summary.cutting_propagation_details.is_applicable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Cuttings</span>
                        <span className={`px-2 py-1 rounded-full ${pcm.propagation_methods_summary.grafting_propagation_details.is_applicable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Grafting</span>
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-semibold text-lg flex items-center">✂️ Pruning</h3>
                  <EditableText labelText="Objectives" currentValue={pcm.pruning_shaping.pruning_objectives.join(', ')} onSave={v => handleFieldChange('plant_care_maintenance.pruning_shaping.pruning_objectives', v.split(',').map(s=>s.trim()))} disabled={!isEditing || !user} textarea />
                  <EditableText labelText="Techniques" currentValue={pcm.pruning_shaping.pruning_techniques_description || ''} onSave={v => handleFieldChange('plant_care_maintenance.pruning_shaping.pruning_techniques_description', v)} disabled={!isEditing || !user} textarea />
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-semibold text-lg flex items-center">💧 Water, Soil & Repotting</h3>
                  <EditableText labelText="Watering" currentValue={cgc.water_requirements_general.recommended_watering_frequency_moisture_level} onSave={v => handleFieldChange('cultivation_growing_conditions.water_requirements_general.recommended_watering_frequency_moisture_level', v)} disabled={!isEditing || !user} textarea />
                  <EditableText labelText="Soil" currentValue={cgc.soil_requirements_general.preferred_soil_types.join(', ')} onSave={v => handleFieldChange('cultivation_growing_conditions.soil_requirements_general.preferred_soil_types', v.split(',').map(s=>s.trim()))} disabled={!isEditing || !user} textarea />
                  <EditableText labelText="Repotting" currentValue={pcm.repotting_for_container_plants?.repotting_instructions || 'N/A'} onSave={v => handleFieldChange('plant_care_maintenance.repotting_for_container_plants.repotting_instructions', v)} disabled={!isEditing || !user} textarea />
                </div>
             </div>
         );
      case 'ecology':
         return (
             <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-semibold text-lg flex items-center">❤️ Companion Planting</h3>
                    <CompanionDisplay title="Beneficial (Aids others)" companions={ei.companion_planting.beneficial_companions_plants_it_aids} icon="💖" />
                    <CompanionDisplay title="Synergistic (Is aided by)" companions={ei.companion_planting.synergistic_companions_plants_that_aid_it} icon="✨" />
                    <CompanionDisplay title="Antagonistic (Avoid)" companions={ei.companion_planting.antagonistic_plants_avoid_nearby} icon="👎" />
                </div>
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-3">
                    <h3 className="font-semibold text-lg flex items-center">🐛 Pests</h3>
                    {ei.pest_interactions.pests_attracted_to_plant.map((pest, i) => (
                        <div key={i} className="text-sm"><strong className="font-medium">{pest.pest_name}:</strong> {pest.notes}</div>
                    ))}
                 </div>
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-3">
                   <h3 className="font-semibold text-lg flex items-center">🦠 Diseases</h3>
                    {ei.disease_susceptibility.common_diseases.map((disease, i) => (
                        <div key={i} className="text-sm"><strong className="font-medium">{disease.disease_name}:</strong> {disease.symptoms_notes}</div>
                    ))}
                 </div>
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm space-y-3">
                    <h3 className="font-semibold text-lg flex items-center">🦋 Wildlife & Pollinators</h3>
                    <ArrayDisplay items={ei.pollinators_wildlife_interaction.attracts_pollinators} labelText="Attracts" disabled={!isEditing || !user} onSave={(v) => handleFieldChange('ecological_interactions.pollinators_wildlife_interaction.attracts_pollinators', v)} />
                 </div>
             </div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-slate-100 dark:bg-slate-900 flex flex-col relative">
        {/* Hero Section */}
        <div className="relative w-full h-72 flex-shrink-0 group">
            <img src={currentPlant.display_image_url || ''} alt={commonName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden')}}/>
            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 items-center justify-center hidden"><PlantStockIcon className="w-32 h-32 text-slate-400 dark:text-slate-500" /></div>
            
            {onDeselect && !isCompactView && (
                <button onClick={onDeselect} className="absolute top-4 left-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-opacity opacity-0 group-hover:opacity-100 z-10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            )}

            {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full backdrop-blur-sm hover:bg-white/30">
                        <PhotoIcon className="w-5 h-5"/>
                        Upload Image
                    </button>
                    <input ref={imageInputRef} onChange={handleImageUpload} type="file" className="hidden" />
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <EditableText
                  currentValue={commonName}
                  onSave={v => handleFieldChange('plant_identification_overview.common_names', [v])}
                  disabled={!isEditing || !user}
                  labelText=""
                  textarea={false}
                  textClassName="text-3xl font-bold [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]"
                  inputFieldClass="text-3xl font-bold bg-transparent"
                  inputContainerClassName="bg-transparent"
                />
                 <EditableText
                  currentValue={currentPlant.plant_identification_overview?.latin_name_scientific_name || ''}
                  onSave={v => handleFieldChange('plant_identification_overview.latin_name_scientific_name', v)}
                  disabled={!isEditing || !user}
                  labelText=""
                  textarea={false}
                  textClassName="text-sm italic [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"
                  inputFieldClass="text-sm italic bg-transparent"
                  inputContainerClassName="bg-transparent"
                />
                 <EditableText
                  currentValue={currentPlant.plant_identification_overview?.plant_family || ''}
                  onSave={v => handleFieldChange('plant_identification_overview.plant_family', v)}
                  disabled={!isEditing || !user}
                  labelText=""
                  textarea={false}
                  textClassName="text-xs mt-1 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"
                  inputFieldClass="text-xs mt-1 bg-transparent"
                  inputContainerClassName="bg-transparent"
                />
            </div>
        </div>
        
        {/* Tabs */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
            <div className="flex justify-around">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Tab Content */}
        <div className="flex-grow overflow-y-auto p-4 pb-32">
            {renderTabContent()}
        </div>
        
        {/* FAB System */}
        <FabSystem />
    </div>
  );
};

export default PlantDetailView;
