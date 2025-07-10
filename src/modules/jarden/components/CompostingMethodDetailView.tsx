
import React, { useRef, useState, useEffect } from 'react';
import { CompostingMethod, CompostingMethodData } from '../types';
import { COMPOSTING_METHOD_LABELS, MODULES } from '../constants';
import SectionCard from './SectionCard';
import EditableText from './EditableText';
import { CubeTransparentIcon, DocumentTextIcon, CogIcon, AdjustmentsVerticalIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, SparklesIcon, InformationCircleIcon, ListBulletIcon, ChatBubbleBottomCenterTextIcon, UsersIcon, ScaleIcon, TagIcon, PencilIcon, VariableIcon as VariableOutlineIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64 } from '../utils/imageUtils';

interface CompostingMethodDetailViewProps {
  method: CompostingMethod | null;
  onUpdateMethod: (methodId: string, updatedData: Partial<CompostingMethod>) => void;
  setAppError: (error: string | null) => void;
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
}

const CompostingMethodDetailView: React.FC<CompostingMethodDetailViewProps> = ({ method, onUpdateMethod, setAppError, moduleConfig, onDeselect, isCompactView }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageObjectPositionY, setImageObjectPositionY] = useState(method?.data.image_object_position_y || 50);

  useEffect(() => {
    if (method) {
      setImageObjectPositionY(method.data.image_object_position_y || 50);
    }
  }, [method]);

  const handleSaveDirectField = (field: keyof Pick<CompostingMethod, 'method_name' | 'primary_composting_approach' | 'scale_of_operation'>, value: string) => {
    if (method) {
      onUpdateMethod(method.id, { [field]: value });
    }
  };
  
  const handleSaveDataField = (field: keyof CompostingMethodData, value: string | number | undefined) => {
    if (method) {
      const updatedData = { ...method.data, [field]: value };
      onUpdateMethod(method.id, { data: updatedData });
    }
  };
  
  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!method) return;
    const file = event.target.files?.[0];
    if (file) {
      try {
        setAppError(null);
        const base64 = await convertFileToBase64(file);
        setImageObjectPositionY(50); // Reset position for new image
        handleSaveDataField('imageUrl', base64);
        handleSaveDataField('image_object_position_y', 50); // Explicitly save reset position
      } catch (err) {
        console.error("Error converting file to base64:", err);
        setAppError("Failed to update image. Please try another file.");
      }
    }
  };

  const handleImagePositionChange = (direction: 'up' | 'down' | 'reset') => {
    if (!method) return;
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
    handleSaveDataField('image_object_position_y', newPosition);
  };

  if (!method) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">
        <CubeTransparentIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">CompostCorner</h2>
        <p className="text-lg">Select a composting method from the list to view its details, or add a new one.</p>
      </div>
    );
  }
  
  const getSectionIconElement = (key: keyof CompostingMethodData | keyof CompostingMethod | string): React.ElementType => {
    switch(key) {
        case 'method_name': return TagIcon;
        case 'primary_composting_approach': return AdjustmentsVerticalIcon;
        case 'description': return DocumentTextIcon;
        case 'complexity': return CogIcon;
        case 'scale_of_operation': return UsersIcon;
        case 'timeToMature': return ClockIcon;
        case 'systemDesignSetup': return ScaleIcon; 
        case 'inputMaterialsGreen': case 'inputMaterialsBrown': return ListBulletIcon;
        case 'optimalCNRatio': return VariableOutlineIcon; 
        case 'materialsToStrictlyAvoid': return ExclamationTriangleIcon;
        case 'processManagement': return CogIcon;
        case 'leachateManagement': return CubeTransparentIcon; 
        case 'troubleshootingCommonIssues': return InformationCircleIcon;
        case 'finishedCompostCharacteristics': return CheckCircleIcon;
        case 'harvestingAndUsingCompost': return SparklesIcon;
        case 'methodSpecifics': return DocumentTextIcon;
        case 'environmentalBenefits': return SparklesIcon;
        case 'userNotes': return ChatBubbleBottomCenterTextIcon;
        case 'informationSources': return ListBulletIcon;
        default: return CubeTransparentIcon;
    }
  };

  const renderEditableDataField = (fieldKey: keyof CompostingMethodData, isTextarea: boolean = true, placeholder?: string, labelTextOverride?: string): React.ReactNode => (
    <EditableText
      currentValue={String(method.data[fieldKey] ?? '')}
      onSave={(val) => handleSaveDataField(fieldKey, val)}
      textarea={isTextarea}
      placeholder={placeholder || `Details about ${COMPOSTING_METHOD_LABELS[fieldKey]?.toLowerCase()}...`}
      labelText={labelTextOverride || COMPOSTING_METHOD_LABELS[fieldKey]}
      textSize="text-sm"
    />
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto bg-white dark:bg-slate-800 custom-scrollbar">
      {isCompactView && method && onDeselect && (
        <button
          onClick={onDeselect}
          className={`mb-4 flex items-center px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-${moduleConfig.baseColorClass}-500`}
          aria-label="Back to composting methods list"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          Back to List
        </button>
      )}
      <div className="max-w-4xl mx-auto space-y-5">
        <div className={`p-5 bg-slate-100 dark:bg-slate-800/50 shadow-sm rounded-2xl`}>
           <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="relative group/imgcontrol flex-shrink-0">
                <img 
                src={method.data.imageUrl || `https://picsum.photos/seed/${method.method_name.trim().toLowerCase().replace(/\s+/g, '-')}/200/200`} 
                alt={method.method_name} 
                className={`w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-${moduleConfig.baseColorClass}-300 dark:border-${moduleConfig.baseColorClass}-600 shadow-lg`}
                style={{ objectPosition: `50% ${imageObjectPositionY}%`}}
                 onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = `https://picsum.photos/seed/compostplaceholder/200/200`;
                }}
                />
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={imageInputRef} 
                    onChange={handleImageFileChange} 
                    className="hidden"
                    id={`compostImageUpload-${method.id}`}
                />
                <button 
                    onClick={() => imageInputRef.current?.click()}
                    title="Change method image"
                    className={`absolute bottom-2 right-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-full shadow-md opacity-0 group-hover/imgcontrol:opacity-100 transition-opacity hover:bg-slate-200 dark:hover:bg-slate-600 text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-300`}
                    aria-label="Edit method image"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                {method.data.imageUrl && (
                    <div className="absolute top-1/2 -translate-y-1/2 -right-12 z-30 flex flex-col space-y-1 opacity-0 group-hover/imgcontrol:opacity-100 transition-opacity duration-200">
                        <button onClick={() => handleImagePositionChange('up')} title="Move image up" className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full shadow-md"><ChevronUpIcon className="w-4 h-4"/></button>
                        <button onClick={() => handleImagePositionChange('reset')} title="Reset image position" className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full shadow-md"><ArrowPathIcon className="w-4 h-4"/></button>
                        <button onClick={() => handleImagePositionChange('down')} title="Move image down" className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full shadow-md"><ChevronDownIcon className="w-4 h-4"/></button>
                    </div>
                )}
            </div>
            <div className="flex-grow">
             <EditableText
                  currentValue={method.method_name}
                  onSave={(val) => handleSaveDirectField('method_name', val)}
                  labelText="Method Name"
                  textClassName={`text-2xl md:text-3xl font-medium text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-400 mb-2`}
                  inputFieldClass={`text-2xl md:text-3xl font-medium text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-400`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <EditableText currentValue={method.primary_composting_approach} onSave={(val) => handleSaveDirectField('primary_composting_approach', val)} labelText="Approach" textarea={false} textSize="text-sm" />
                {renderEditableDataField('complexity', false, undefined, "Complexity")}
              </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                <EditableText currentValue={method.scale_of_operation} onSave={(val) => handleSaveDirectField('scale_of_operation', val)} labelText="Scale" textarea={false} textSize="text-sm" />
                {renderEditableDataField('timeToMature', false, "e.g., 2-3 months", "Time to Mature")}
              </div>
            </div>
          </div>
        </div>

        <SectionCard title="Method Overview" icon={getSectionIconElement('description')}>
            {renderEditableDataField('description')}
            <div className="mt-2">{renderEditableDataField('systemDesignSetup')}</div>
        </SectionCard>

        <SectionCard title="Input Materials" icon={getSectionIconElement('inputMaterialsGreen')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {renderEditableDataField('inputMaterialsGreen', true, "Nitrogen-rich materials...")}
                {renderEditableDataField('inputMaterialsBrown', true, "Carbon-rich materials...")}
            </div>
             <div className="mt-2">
                {renderEditableDataField('optimalCNRatio', false, "e.g., 25:1 to 30:1")}
             </div>
            <div className="mt-2">{renderEditableDataField('materialsToStrictlyAvoid')}</div>
        </SectionCard>

        <SectionCard title="Process & Management" icon={getSectionIconElement('processManagement')}>
            {renderEditableDataField('processManagement')}
            <div className="mt-2">{renderEditableDataField('leachateManagement')}</div>
            <div className="mt-2">{renderEditableDataField('troubleshootingCommonIssues')}</div>
        </SectionCard>

        <SectionCard title="Finished Product & Use" icon={getSectionIconElement('finishedCompostCharacteristics')}>
            {renderEditableDataField('finishedCompostCharacteristics')}
            <div className="mt-2">{renderEditableDataField('harvestingAndUsingCompost')}</div>
        </SectionCard>

        <SectionCard title="Additional Information" icon={getSectionIconElement('methodSpecifics')}>
            {renderEditableDataField('methodSpecifics')}
            <div className="mt-2">{renderEditableDataField('environmentalBenefits')}</div>
        </SectionCard>

        <SectionCard title={COMPOSTING_METHOD_LABELS.userNotes || "User Notes"} icon={getSectionIconElement('userNotes')}>
            {renderEditableDataField('userNotes', true, "Add your personal observations or tips...")}
        </SectionCard>
        
        <SectionCard title={COMPOSTING_METHOD_LABELS.informationSources || "Information Sources"} icon={getSectionIconElement('informationSources')}>
            {renderEditableDataField('informationSources', true, "List sources like websites, books...")}
        </SectionCard>
      </div>
    </div>
  );
};

export default CompostingMethodDetailView;
