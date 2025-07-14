
import React, { useRef, useState, useEffect } from 'react';
import { produce } from 'immer';
import { Fertilizer, FertilizerData } from '../types';
import { FERTILIZER_SECTION_LABELS, MODULES } from '../constants';
import SectionCard from './SectionCard';
import EditableText from './EditableText';
import { BeakerIcon, DocumentTextIcon, InformationCircleIcon, ListBulletIcon, VariableIcon, AdjustmentsHorizontalIcon, ClockIcon, ShieldCheckIcon, ArchiveBoxIcon, UserCircleIcon, ChatBubbleBottomCenterTextIcon, SparklesIcon, TagIcon, CubeIcon, PencilIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64 } from '../utils/imageUtils';
import { useAuth } from '../../../../context/AuthContext';


interface FertilizerDetailViewProps {
  fertilizer: Fertilizer | null;
  onUpdateFertilizer: (fertilizerId: string, updatedData: Partial<Fertilizer>) => void;
  setAppError: (error: string | null) => void;
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
}

const FertilizerDetailView: React.FC<FertilizerDetailViewProps> = ({ fertilizer: initialFertilizer, onUpdateFertilizer, setAppError, moduleConfig, onDeselect, isCompactView }) => {
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableFertilizer, setEditableFertilizer] = useState<Fertilizer | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditableFertilizer(initialFertilizer ? JSON.parse(JSON.stringify(initialFertilizer)) : null);
    }
  }, [initialFertilizer, isEditing]);

  const handleFieldChange = (path: string, value: any) => {
    if (!editableFertilizer) return;
    setEditableFertilizer(current => produce(current!, draft => {
      if (!draft) return;
      let currentPath: any = draft;
      const keys = path.split('.');
      for (let i = 0; i < keys.length - 1; i++) {
        currentPath = currentPath[keys[i]];
      }
      currentPath[keys[keys.length - 1]] = value;
    }));
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableFertilizer) return;
    const file = event.target.files?.[0];
    if (file) {
      try {
        setAppError(null);
        const base64 = await convertFileToBase64(file);
        handleFieldChange('data.imageUrl', base64);
        handleFieldChange('data.image_object_position_y', 50);
      } catch (err) {
        setAppError("Failed to update image.");
      }
    }
  };
  
  const handleImagePositionChange = (direction: 'up' | 'down' | 'reset') => {
    if (!editableFertilizer) return;
    let newPosition = editableFertilizer.data.image_object_position_y || 50;
    const step = 5;
    if (direction === 'up') newPosition = Math.max(0, newPosition - step);
    else if (direction === 'down') newPosition = Math.min(100, newPosition + step);
    else newPosition = 50;
    handleFieldChange('data.image_object_position_y', newPosition);
  };
  
  const handleSave = () => {
    if (initialFertilizer && editableFertilizer) {
      onUpdateFertilizer(initialFertilizer.id, editableFertilizer);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableFertilizer(initialFertilizer);
  };

  const fertilizer = editableFertilizer || initialFertilizer;

  if (!fertilizer) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#A67C52] bg-white">
        <BeakerIcon className="w-24 h-24 text-[#6C8C61] mb-6" />
        <h2 className="text-3xl font-semibold text-[#1D3117] mb-2">NutriBase</h2>
        <p className="text-lg">Select a fertilizer from the list to view its details, or add a new one.</p>
      </div>
    );
  }

  const getSectionIconElement = (key: keyof FertilizerData | string): React.ElementType => {
    switch(key) {
      case 'fertilizer_name': return TagIcon;
      case 'type': case 'form': return CubeIcon;
      case 'description': return DocumentTextIcon;
      case 'primaryUses': return SparklesIcon;
      case 'ingredients': return ListBulletIcon;
      case 'npkRatio': return VariableIcon;
      case 'secondaryMicronutrients': return BeakerIcon;
      case 'phImpact': return AdjustmentsHorizontalIcon;
      case 'applicationMethods': case 'applicationFrequency': case 'dilutionRate': return InformationCircleIcon;
      case 'releaseProfile': return ClockIcon;
      case 'targetPlants': case 'bestPlantStages': return UserCircleIcon; 
      case 'storageRequirements': return ArchiveBoxIcon;
      case 'shelfLife': return ClockIcon;
      case 'safetyPrecautions': return ShieldCheckIcon;
      case 'compatibilityNotes': return DocumentTextIcon;
      case 'userNotes': return ChatBubbleBottomCenterTextIcon;
      case 'informationSources': return ListBulletIcon;
      default: return BeakerIcon;
    }
  };
  
  const renderEditableDataField = (fieldKey: keyof FertilizerData, isTextarea: boolean = true, placeholder?: string, labelTextOverride?: string): React.ReactNode => (
    <EditableText
      currentValue={String(fertilizer.data[fieldKey] ?? '')}
      onSave={(val) => handleFieldChange(`data.${fieldKey}`, val)}
      textarea={isTextarea}
      placeholder={placeholder || `Details about ${FERTILIZER_SECTION_LABELS[fieldKey]?.toLowerCase()}...`}
      labelText={labelTextOverride || FERTILIZER_SECTION_LABELS[fieldKey]}
      textSize="text-sm"
      disabled={!isEditing || !user}
    />
  );

  const imageObjectPositionY = fertilizer.data.image_object_position_y || 50;

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto bg-white custom-scrollbar">
      {isCompactView && fertilizer && onDeselect && !isEditing && (
        <button
          onClick={onDeselect}
          className={`mb-4 flex items-center px-4 py-2 text-sm font-medium bg-[#E5E3DD] text-[#6C8C61] hover:bg-[#DCEFD6] rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C8C61]`}
          aria-label="Back to fertilizer list"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          Back to List
        </button>
      )}
      <div className="max-w-4xl mx-auto space-y-5">
        <div className={`p-5 bg-[#FDFCF9] shadow-sm rounded-2xl`}>
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="relative group/imgcontrol flex-shrink-0">
              <img 
                src={fertilizer.data.imageUrl || `https://picsum.photos/seed/${fertilizer.fertilizer_name.trim().toLowerCase().replace(/\s+/g, '-')}/200/200`} 
                alt={fertilizer.fertilizer_name} 
                className={`w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-[#DCEFD6] shadow-lg`}
                style={{ objectPosition: `50% ${imageObjectPositionY}%`}}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = `https://picsum.photos/seed/fertilizerplaceholder/200/200`;
                }}
              />
              {user && isEditing && (
                <>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={imageInputRef} 
                        onChange={handleImageFileChange} 
                        className="hidden"
                        id={`fertilizerImageUpload-${fertilizer.id}`}
                    />
                    <button 
                        onClick={() => imageInputRef.current?.click()}
                        title="Change fertilizer image"
                        className={`absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover/imgcontrol:opacity-100 transition-opacity hover:bg-[#E5E3DD] text-[#6C8C61]`}
                        aria-label="Edit fertilizer image"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    {fertilizer.data.imageUrl && (
                        <div className="absolute top-1/2 -translate-y-1/2 -right-12 z-30 flex flex-col space-y-1 opacity-0 group-hover/imgcontrol:opacity-100 transition-opacity duration-200">
                            <button onClick={() => handleImagePositionChange('up')} title="Move image up" className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full shadow-md"><ChevronUpIcon className="w-4 h-4"/></button>
                            <button onClick={() => handleImagePositionChange('reset')} title="Reset image position" className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full shadow-md"><ArrowPathIcon className="w-4 h-4"/></button>
                            <button onClick={() => handleImagePositionChange('down')} title="Move image down" className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full shadow-md"><ChevronDownIcon className="w-4 h-4"/></button>
                        </div>
                    )}
                </>
              )}
            </div>
            <div className="flex-grow">
              <EditableText
                  currentValue={fertilizer.fertilizer_name}
                  onSave={(val) => handleFieldChange('fertilizer_name', val)}
                  labelText="Fertilizer Name"
                  textClassName={`text-2xl md:text-3xl font-medium text-[#6C8C61] mb-2`}
                  inputFieldClass={`text-2xl md:text-3xl font-medium text-[#6C8C61]`}
                  disabled={!isEditing || !user}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                 <EditableText
                    currentValue={fertilizer.type}
                    onSave={(val) => handleFieldChange('type', val)}
                    labelText={FERTILIZER_SECTION_LABELS.type}
                    textarea={false}
                    textSize="text-sm"
                    disabled={!isEditing || !user}
                 />
                 <EditableText
                    currentValue={fertilizer.form}
                    onSave={(val) => handleFieldChange('form', val)}
                    labelText={FERTILIZER_SECTION_LABELS.form}
                    textarea={false}
                    textSize="text-sm"
                    disabled={!isEditing || !user}
                 />
              </div>
              <div className="mt-2">
                {renderEditableDataField('description', true, "e.g., Natural fish-based fertilizer...", "Description")}
              </div>
            </div>
          </div>
        </div>
                
        <SectionCard title="Composition & Properties" icon={getSectionIconElement('npkRatio')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {renderEditableDataField('npkRatio', false, "e.g., 10-10-10")}
                {renderEditableDataField('secondaryMicronutrients', true, "e.g., Calcium, Magnesium, Sulfur...")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {renderEditableDataField('phImpact', false, "e.g., Acidic, Neutral, Alkaline")}
                {renderEditableDataField('electricalConductivity', false, "e.g., 1.5 mS/cm")}
            </div>
        </SectionCard>
        
        <SectionCard title="Application Details" icon={getSectionIconElement('applicationMethods')}>
             {renderEditableDataField('applicationMethods', true, "e.g., Soil drench, foliar spray...")}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {renderEditableDataField('applicationFrequency', false, "e.g., Every 2 weeks")}
                {renderEditableDataField('dilutionRate', false, "e.g., 1 tbsp per gallon")}
             </div>
        </SectionCard>

        <SectionCard title="Target & Usage" icon={getSectionIconElement('targetPlants')}>
            {renderEditableDataField('releaseProfile', false, "e.g., Slow, Fast, Controlled")}
            <div className="mt-2">{renderEditableDataField('targetPlants', true, "e.g., Vegetables, Roses, Fruit Trees...")}</div>
            <div className="mt-2">{renderEditableDataField('bestPlantStages', true, "e.g., Seedling, Vegetative, Flowering...")}</div>
        </SectionCard>
        
        <SectionCard title="Storage & Safety" icon={getSectionIconElement('storageRequirements')}>
            {renderEditableDataField('storageRequirements')}
            <div className="mt-2">{renderEditableDataField('shelfLife', false, "e.g., 2 years")}</div>
            <div className="mt-2">{renderEditableDataField('safetyPrecautions')}</div>
        </SectionCard>

        <SectionCard title="Additional Information" icon={getSectionIconElement('compatibilityNotes')}>
            {renderEditableDataField('compatibilityNotes', true, "e.g., Do not mix with X...")}
            <div className="mt-2">{renderEditableDataField('primaryUses', true, "e.g., Boosts leaf growth, improves fruiting...")}</div>
            <div className="mt-2">{renderEditableDataField('ingredients', true, "e.g., Fish meal, kelp extract, worm castings...")}</div>
            <div className="mt-2">{renderEditableDataField('userNotes', true, "e.g., My plants love this stuff!")}</div>
            <div className="mt-2">{renderEditableDataField('informationSources', true, "e.g., Product website, gardening book...")}</div>
        </SectionCard>

      </div>
       {user && (
            <div className="sticky bottom-0 right-0 w-full p-4 bg-gradient-to-t from-white to-transparent flex justify-end">
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-[#1D3117] text-white rounded-full shadow-lg hover:bg-[#3D2A15] flex items-center gap-2">
                        <PencilIcon className="w-5 h-5"/> Edit Details
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button onClick={handleCancel} className="px-5 py-2.5 bg-[#E5E3DD] text-[#2C2C2C] rounded-full shadow-lg hover:bg-[#DCEFD6]">Cancel</button>
                        <button onClick={handleSave} className="px-5 py-2.5 bg-[#6C8C61] text-white rounded-full shadow-lg hover:bg-[#5a7850]">Save Changes</button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default FertilizerDetailView;
