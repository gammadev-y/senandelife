



import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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
  CheckIcon,
  ExclamationTriangleIcon, LinkIcon,
  SparklesIcon as OutlineSparklesIcon,
  UsersIcon, GiftIcon, PhotoIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { PlantsIcon, EditIcon, AiFillIcon, AiImage, FabMenuIcon, CancelIcon, SaveIcon } from './icons/JardenIcons';


// --- PROP TYPES ---
interface PlantDetailViewProps {
  plant: Plant | null;
  onUpdatePlant: (plantId: string, updatedData: Partial<Plant>, updatedFromSection?: PlantSectionKeyForAI) => void;
  isLoadingAi: boolean;
  setIsLoadingAi: (loading: boolean) => void;
  setAppError: (error: string | null) => void;
  onPopulateWithStandardAI: (plantId: string) => void;
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

// --- TYPE DEFINITIONS ---
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
        <h4 className="font-semibold text-sm flex items-baseline mb-2">
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {labelText}
        </h4>
        {items && items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span key={i} className="px-2.5 py-1 text-xs font-medium bg-[#E5E3DD] rounded-full text-[#2C2C2C]">{item}</span>
            ))}
          </div>
        ) : <p className="text-xs text-[#A67C52] italic">None specified</p>}
      </div>
    );
  }

  if (isLocalEditing) {
    return (
      <div>
        <h4 className="font-semibold text-sm flex items-baseline mb-2">
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {labelText}
        </h4>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          autoFocus
          className="w-full bg-[#E5E3DD] p-2 rounded-lg text-sm"
          rows={3}
          onBlur={(e) => { if (!e.relatedTarget || !['editable-save-button', 'editable-cancel-button'].includes((e.relatedTarget as HTMLElement).dataset.role || '')) { handleLocalSave(); } }}
        />
         <div className="mt-2.5 flex justify-end space-x-2">
          <button data-role="editable-cancel-button" onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium text-[#6C8C61] hover:bg-[#DCEFD6] rounded-full focus:outline-none focus:ring-2 focus:ring-[#6C8C61]">Cancel</button>
          <button data-role="editable-save-button" onClick={handleLocalSave} className="px-3 py-1.5 text-xs font-medium text-[#6C8C61] hover:bg-[#DCEFD6] rounded-full focus:outline-none focus:ring-2 focus:ring-[#6C8C61]">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer" onClick={() => setIsLocalEditing(true)}>
      <h4 className="font-semibold text-sm flex items-baseline mb-2 group-hover:text-[#6C8C61]">
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {labelText}
      </h4>
      <div className="p-2 rounded-lg wave-bg" style={{ backgroundImage: 'linear-gradient(to right, #F3E1D2, #E5E3DD, #F3E1D2)', backgroundSize: '200% 100%' }}>
        {items && items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span key={i} className="px-2.5 py-1 text-xs font-medium bg-[#E5E3DD] rounded-full text-[#2C2C2C]">{item}</span>
            ))}
          </div>
        ) : <p className="text-xs text-[#A67C52] italic">None specified</p>}
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
          <span key={i} className="px-2.5 py-1 text-xs font-medium bg-[#E5E3DD] rounded-full text-[#2C2C2C]" title={c.reason || ''}>{c.plant_name_or_id}</span>
        ))}
      </div>
    ) : <p className="text-xs text-[#A67C52] italic">None specified</p>}
  </div>
);

// --- MAIN COMPONENT ---

const PlantDetailView = forwardRef<any, PlantDetailViewProps>(({
  plant: initialPlant, onUpdatePlant, onDeselect, isCompactView, onPopulateWithStandardAI, moduleConfig, setAppError, setIsLoadingAi, isLoadingAi, isEditing, setIsEditing
}, ref) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [editablePlant, setEditablePlant] = useState<Plant | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const prevPlantId = useRef<string | undefined>();

  useEffect(() => {
    if (initialPlant?.id !== prevPlantId.current) {
        setActiveTab('overview');
    }
    if (!isEditing) {
        setEditablePlant(initialPlant ? JSON.parse(JSON.stringify(initialPlant)) : null);
    }
    prevPlantId.current = initialPlant?.id;
  }, [initialPlant, isEditing]);
  
  const handleFieldChange = (path: string, value: any) => {
    if (!editablePlant) return;
    setEditablePlant(current => produce(current!, draft => {
        if (!draft) return;
        let currentPath: any = draft;
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) {
            if (currentPath[keys[i]] === undefined || currentPath[keys[i]] === null) {
                currentPath[keys[i]] = {};
            }
            currentPath = currentPath[keys[i]];
        }
        currentPath[keys[keys.length - 1]] = value;
    }));
  };

  const handleSave = () => {
    if (initialPlant && editablePlant) {
      onUpdatePlant(initialPlant.id, editablePlant);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditablePlant(initialPlant); 
  };
  
  useImperativeHandle(ref, () => ({
    save: handleSave,
    cancel: handleCancel,
  }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && initialPlant) {
        try {
            const base64 = await convertFileToBase64(e.target.files[0]);
            onUpdatePlant(initialPlant.id, { display_image_url: base64, image_object_position_y: 50 });
        } catch (err) {
            setAppError("Failed to upload image.");
        }
    }
  };

  if (!initialPlant) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 bg-white">
        <PlantStockIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
        <h2 className="text-3xl font-semibold text-[#1D3117] mb-2">FloraPedia</h2>
        <p className="text-lg text-[#A67C52]">Select a plant to view its details.</p>
      </div>
    );
  }

  const currentPlant = editablePlant || initialPlant;
  
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
             <div className="p-4 bg-white rounded-2xl shadow-sm">
                <EditableText currentValue={pio.description_brief} onSave={v => handleFieldChange('plant_identification_overview.description_brief', v)} disabled={!isEditing || !user} textarea labelText="Description" />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <EditableText labelText="Type" currentValue={pio.plant_type_category} onSave={v => handleFieldChange('plant_identification_overview.plant_type_category', v)} disabled={!isEditing || !user} textarea={false}/>
                  <EditableText labelText="Habit" currentValue={pio.growth_structure_habit} onSave={v => handleFieldChange('plant_identification_overview.growth_structure_habit', v)} disabled={!isEditing || !user} textarea={false}/>
                  <EditableText labelText="Life Cycle" currentValue={pio.life_cycle} onSave={v => handleFieldChange('plant_identification_overview.life_cycle', v)} disabled={!isEditing || !user} textarea={false}/>
                  <EditableText labelText="Cultivar" currentValue={pio.cultivar_variety || ''} onSave={v => handleFieldChange('plant_identification_overview.cultivar_variety', v)} disabled={!isEditing || !user} textarea={false}/>
                </div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm space-y-3">
                 <h3 className="font-semibold text-lg flex items-center">📏 Dimensions & Hardiness</h3>
                 <EditableText currentValue={pio.expected_mature_height_meters.text_range} onSave={v => handleFieldChange('plant_identification_overview.expected_mature_height_meters.text_range', v)} disabled={!isEditing || !user} labelText="Mature Height" textarea={false} />
                 <EditableText currentValue={pio.expected_mature_spread_width_meters.text_range} onSave={v => handleFieldChange('plant_identification_overview.expected_mature_spread_width_meters.text_range', v)} disabled={!isEditing || !user} labelText="Mature Spread" textarea={false} />
                 <EditableText currentValue={pio.hardiness_zones.usda || ''} onSave={v => handleFieldChange('plant_identification_overview.hardiness_zones.usda', v)} disabled={!isEditing || !user} labelText="USDA Zone" textarea={false} />
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm space-y-3">
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
                <div className="p-4 bg-white rounded-2xl shadow-sm space-y-3">
                    <h3 className="font-semibold text-lg flex items-center">🌱 Propagation</h3>
                    <p className="text-sm font-medium">Methods:</p>
                    <div className="flex gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${pcm.propagation_methods_summary.seed_propagation_details.is_applicable ? 'bg-green-100 text-green-800' : 'bg-[#E5E3DD] text-[#A67C52]'}`}>Seed</span>
                        <span className={`px-2 py-1 rounded-full ${pcm.propagation_methods_summary.cutting_propagation_details.is_applicable ? 'bg-green-100 text-green-800' : 'bg-[#E5E3DD] text-[#A67C52]'}`}>Cuttings</span>
                        <span className={`px-2 py-1 rounded-full ${pcm.propagation_methods_summary.grafting_propagation_details.is_applicable ? 'bg-green-100 text-green-800' : 'bg-[#E5E3DD] text-[#A67C52]'}`}>Grafting</span>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-semibold text-lg flex items-center">✂️ Pruning</h3>
                  <ArrayDisplay items={pcm.pruning_shaping.pruning_objectives} labelText="Objectives" disabled={!isEditing || !user} onSave={v => handleFieldChange('plant_care_maintenance.pruning_shaping.pruning_objectives', v)} />
                  <EditableText labelText="Techniques" currentValue={pcm.pruning_shaping.pruning_techniques_description || ''} onSave={v => handleFieldChange('plant_care_maintenance.pruning_shaping.pruning_techniques_description', v)} disabled={!isEditing || !user} textarea />
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-semibold text-lg flex items-center">💧 Water, Soil & Repotting</h3>
                  <EditableText labelText="Watering" currentValue={cgc.water_requirements_general.recommended_watering_frequency_moisture_level} onSave={v => handleFieldChange('cultivation_growing_conditions.water_requirements_general.recommended_watering_frequency_moisture_level', v)} disabled={!isEditing || !user} textarea />
                  <ArrayDisplay items={cgc.soil_requirements_general.preferred_soil_types} labelText="Soil" disabled={!isEditing || !user} onSave={v => handleFieldChange('cultivation_growing_conditions.soil_requirements_general.preferred_soil_types', v)} />
                  <EditableText labelText="Repotting" currentValue={pcm.repotting_for_container_plants?.repotting_instructions || 'N/A'} onSave={v => handleFieldChange('plant_care_maintenance.repotting_for_container_plants.repotting_instructions', v)} disabled={!isEditing || !user} textarea />
                </div>
             </div>
         );
      case 'ecology':
         return (
             <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-semibold text-lg flex items-center">❤️ Companion Planting</h3>
                    <CompanionDisplay title="Beneficial (Aids others)" companions={ei.companion_planting.beneficial_companions_plants_it_aids} icon="💖" />
                    <CompanionDisplay title="Synergistic (Is aided by)" companions={ei.companion_planting.synergistic_companions_plants_that_aid_it} icon="✨" />
                    <CompanionDisplay title="Antagonistic (Avoid)" companions={ei.companion_planting.antagonistic_plants_avoid_nearby} icon="👎" />
                </div>
                 <div className="p-4 bg-white rounded-2xl shadow-sm space-y-3">
                    <h3 className="font-semibold text-lg flex items-center">🐛 Pests</h3>
                    {ei.pest_interactions.pests_attracted_to_plant.map((pest, i) => (
                        <div key={i} className="text-sm"><strong className="font-medium">{pest.pest_name}:</strong> {pest.notes}</div>
                    ))}
                 </div>
                 <div className="p-4 bg-white rounded-2xl shadow-sm space-y-3">
                   <h3 className="font-semibold text-lg flex items-center">🦠 Diseases</h3>
                    {ei.disease_susceptibility.common_diseases.map((disease, i) => (
                        <div key={i} className="text-sm"><strong className="font-medium">{disease.disease_name}:</strong> {disease.symptoms_notes}</div>
                    ))}
                 </div>
                 <div className="p-4 bg-white rounded-2xl shadow-sm space-y-3">
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
    <div className="h-full bg-[#fdfcf9] flex flex-col relative animate-slide-in-left">
        <style>{`
          @keyframes slideInFromLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in-left {
            animation: slideInFromLeft 0.5s ease-out forwards;
          }
          @keyframes backgroundWave {
            from { background-position: 0% 50%; }
            to { background-position: 100% 50%; }
          }
          .group:hover .wave-bg {
            animation: backgroundWave 1s ease-in-out;
          }
        `}</style>
        {/* Hero Section */}
        <div className="relative w-full h-72 flex-shrink-0 group">
            <img src={currentPlant.display_image_url || ''} alt={commonName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden')}}/>
            <div className="w-full h-full bg-[#E5E3DD] items-center justify-center hidden"></div>
            
            {onDeselect && isCompactView && (
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
            
            <div className="absolute inset-0 p-4 md:p-6 flex items-end justify-start overflow-hidden pointer-events-none">
              <div className="bg-[#fdfcf9]/80 backdrop-blur-md rounded-2xl p-4 md:p-5 w-auto max-w-lg pointer-events-auto">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                        <PlantsIcon className="w-8 h-8 text-[#6C8C61]" />
                    </div>
                     <div className="flex-grow">
                         <EditableText
                          currentValue={commonName}
                          onSave={v => handleFieldChange('plant_identification_overview.common_names', [v])}
                          disabled={!isEditing || !user}
                          labelText=""
                          textarea={false}
                          textClassName="text-xl font-bold text-[#1D3117]"
                          inputFieldClass="text-xl font-bold bg-transparent text-[#1D3117]"
                          inputContainerClassName="bg-transparent"
                        />
                         <EditableText
                          currentValue={currentPlant.plant_identification_overview?.latin_name_scientific_name || ''}
                          onSave={v => handleFieldChange('plant_identification_overview.latin_name_scientific_name', v)}
                          disabled={!isEditing || !user}
                          labelText=""
                          textarea={false}
                          textClassName="text-sm italic text-[#2C2C2C]"
                          inputFieldClass="text-sm italic bg-transparent text-[#2C2C2C]"
                          inputContainerClassName="bg-transparent"
                        />
                         <EditableText
                          currentValue={currentPlant.plant_identification_overview?.plant_family || ''}
                          onSave={v => handleFieldChange('plant_identification_overview.plant_family', v)}
                          disabled={!isEditing || !user}
                          labelText=""
                          textarea={false}
                          textClassName="text-xs mt-1 text-[#A67C52]"
                          inputFieldClass="text-xs mt-1 bg-transparent text-[#A67C52]"
                          inputContainerClassName="bg-transparent"
                        />
                    </div>
                </div>
              </div>
            </div>

        </div>
        
        {/* Tabs */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-[#E5E3DD] sticky top-0 z-10">
            <div className="flex justify-around">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#6C8C61] text-[#1D3117]' : 'border-transparent text-[#A67C52] hover:text-[#1D3117]'}`}
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
        
    </div>
  );
});

export default PlantDetailView;