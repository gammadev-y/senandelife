


import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GrowingGround, Plant, GroundLogEntry, GrowingGroundPlant, GroundCalendarTask } from '../types';
import { GROWING_GROUND_LABELS, GROUND_LOG_ACTION_TYPE_ICONS, MODULES, GROUND_TYPES } from '../constants';
import SectionCard from './SectionCard';
import EditableText from './EditableText';
import { SunIcon, BeakerIcon, ListBulletIcon, PlusIcon, PhotoIcon, CalendarDaysIcon, PencilIcon, SparklesIcon as OutlineSparklesIcon, CheckIcon, TrashIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon, ArrowPathIcon, XMarkIcon, InformationCircleIcon, TagIcon, SquaresPlusIcon, ChartBarIcon, MapIcon, ChatBubbleBottomCenterTextIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';
import LoadingSpinner from './LoadingSpinner';
import { generateGroundImageWithAi } from '../services/geminiService';
import GroundStockIcon from './icons/GroundStockIcon';
import PlantStockIcon from './icons/PlantStockIcon';
import { produce } from 'https://esm.sh/immer@10.0.3';
import useImageDragAdjust from '../hooks/useImageDragAdjust';
import { deepMerge } from '../utils/objectUtils';
import ImageCarousel from './ImageCarousel';

interface GrowingGroundDetailViewProps {
  ground: GrowingGround | null;
  onUpdateGround: (groundId: string, updatedData: Partial<GrowingGround>) => void;
  onDeleteGround: (groundId: string) => void;
  setAppError: (error: string | null) => void;
  plants: Plant[];
  onOpenAddLogEntryModal: (groundId: string) => void;
  onOpenAddPlantToGroundModal: (groundId: string) => void;
  onOpenAddGroundCalendarTaskModal: (groundId: string) => void;
  onAiGenerateGroundTasks: (groundId: string) => Promise<void>;
  isLoadingAiForGroundTasks: boolean;
  onUpdateGroundTask: (groundId: string, taskId: string, updates: Partial<GroundCalendarTask>) => void;
  onDeleteGroundTask: (groundId: string, taskId: string) => void;
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
}

const PlantInGroundCard: React.FC<{ plantInGround: GrowingGroundPlant; allPlants: Plant[]; isEditing: boolean; onRemove: () => void; }> = ({ plantInGround, allPlants, isEditing, onRemove }) => {
    const plantInfo = allPlants.find(p => p.id === plantInGround.plantId);
    if (!plantInfo) return null;
    return (
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 flex items-start space-x-3 group/plant">
            <img src={plantInfo.display_image_url || undefined} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden');}}  alt={plantInfo.plant_identification_overview.common_names[0]} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
            <div className={`w-16 h-16 rounded-md bg-slate-200 dark:bg-slate-600 items-center justify-center flex-shrink-0 hidden`}>
                <PlantStockIcon className="w-10 h-10 text-slate-400"/>
            </div>
            <div className="flex-grow">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{plantInfo.plant_identification_overview.common_names[0]}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Qty: {plantInGround.quantity} | Status: {plantInGround.status}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plantInGround.notes}</p>
            </div>
             {isEditing && (
                <button onClick={onRemove} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full opacity-0 group-hover/plant:opacity-100 transition-opacity" aria-label={`Remove ${plantInfo.plant_identification_overview.common_names[0]}`}>
                    <TrashIcon className="w-4 h-4"/>
                </button>
            )}
        </div>
    );
};

const GrowingGroundDetailView: React.FC<GrowingGroundDetailViewProps> = ({
  ground: initialGround, onUpdateGround, onDeleteGround, setAppError, plants,
  onOpenAddLogEntryModal, onOpenAddPlantToGroundModal,
  onOpenAddGroundCalendarTaskModal, onAiGenerateGroundTasks, isLoadingAiForGroundTasks,
  onUpdateGroundTask, onDeleteGroundTask, moduleConfig, onDeselect, isCompactView
}) => {
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGroundData, setEditedGroundData] = useState<GrowingGround | null>(null);
  const [isLoadingAiImage, setIsLoadingAiImage] = useState(false);
  const [showTaskArchive, setShowTaskArchive] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  
  const heroImageContainerRef = useRef<HTMLDivElement>(null);
  const currentImageObjectPositionY = (isEditing ? editedGroundData?.image_object_position_y : initialGround?.image_object_position_y) ?? 50;

  const { dragHandlers } = useImageDragAdjust({
    initialPosition: currentImageObjectPositionY,
    onPositionChange: (newPosition) => {
      if (isEditing && editedGroundData) {
        setEditedGroundData(produce(draft => { if (draft) draft.image_object_position_y = newPosition; }));
      }
    },
    imageContainerRef: heroImageContainerRef,
  });

  useEffect(() => {
    if (initialGround) {
      if (!isEditing) {
        setEditedGroundData(JSON.parse(JSON.stringify(initialGround)));
      }
    } else {
      setEditedGroundData(null);
    }
  }, [initialGround, isEditing]);

  const handleDataFieldChange = useCallback((path: string, value: any) => {
    if (!isEditing || !editedGroundData) return;
    setEditedGroundData(produce(draft => {
        if(!draft) return;
        let current: any = draft;
        const keys = path.split('.');
        keys.forEach((key, index) => {
            if(index === keys.length - 1) {
                current[key] = value;
            } else {
                if(!current[key] || typeof current[key] !== 'object') current[key] = {};
                current = current[key];
            }
        });
    }));
  }, [isEditing, editedGroundData]);
  
  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editedGroundData && isEditing) {
      try {
        const compressedFile = await compressFileBeforeUpload(file);
        const base64 = await convertFileToBase64(compressedFile);
        setEditedGroundData(produce(draft => { if(draft) { draft.imageUrl = base64; draft.image_object_position_y = 50; }}));
      } catch (err) {
        setAppError(err instanceof Error ? err.message : "Failed to process image.");
      }
    }
  };

  const handleAiGenerateImage = async () => {
    if (!editedGroundData) return;
    const safePlants = editedGroundData.plants || [];
    const plantNames = safePlants.map(p => plants.find(pl => pl.id === p.plantId)?.plant_identification_overview.common_names[0] || 'plant').filter(Boolean);
    if(plantNames.length === 0) { setAppError("Add plants to this ground before generating an AI image."); return; }

    setIsLoadingAiImage(true);
    setAppError(null);
    try {
      const generatedBase64Image = await generateGroundImageWithAi(plantNames);
      if (generatedBase64Image) {
        setEditedGroundData(produce(draft => { if(draft) { draft.imageUrl = generatedBase64Image; draft.image_object_position_y = 50; }}));
      } else {
        setAppError("AI image generation did not return an image.");
      }
    } catch (err) {
      setAppError(err instanceof Error ? err.message : "Failed to generate image with AI.");
    } finally {
      setIsLoadingAiImage(false);
    }
  };

  const handleSave = () => {
    if (editedGroundData && initialGround) onUpdateGround(initialGround.id, editedGroundData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedGroundData(initialGround ? JSON.parse(JSON.stringify(initialGround)) : null);
  };

  const handleDelete = () => {
    if (initialGround && window.confirm(`Are you sure you want to delete "${initialGround.name}"? This action cannot be undone.`)) {
      onDeleteGround(initialGround.id);
    }
  };
  
  const handleRemovePlantFromGround = (indexToRemove: number) => {
    if (isEditing && editedGroundData) {
        const plantIdToRemove = editedGroundData.plants?.[indexToRemove]?.plantId;
        setEditedGroundData(produce(draft => {
            if (!draft) return;
            // Remove plant from the list
            if (draft.plants) {
                draft.plants.splice(indexToRemove, 1);
            }
            // If a plant was identified and removed, also remove its related tasks
            if (plantIdToRemove && draft.calendarTasks) {
                draft.calendarTasks = draft.calendarTasks.filter(task => 
                    !task.relatedPlantIds?.includes(plantIdToRemove)
                );
            }
        }));
    }
  };

  const handleTaskCheckboxChange = async (taskId: string, newStatus: GroundCalendarTask['status']) => {
    if (!initialGround) return;
    setUpdatingTaskId(taskId);
    try {
      await onUpdateGroundTask(initialGround.id, taskId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task status", error);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  if (!initialGround) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        <GroundStockIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">{moduleConfig.name}</h2>
        <p className="text-lg">Select a ground from the list to view its details, or create a new one.</p>
      </div>
    );
  }
  
  const groundForDisplay = isEditing ? editedGroundData : initialGround;
  if (!groundForDisplay) return null; // Should not happen if initialGround exists
  
  const sortedLogs = [...(groundForDisplay.logs || [])].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const pendingTasks = (groundForDisplay.calendarTasks || []).filter(t => t.status !== 'Completed').sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const completedTasks = (groundForDisplay.calendarTasks || []).filter(t => t.status === 'Completed').sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  
  const photoGalleryImages = sortedLogs
    .flatMap(log => log.photoUrls || [])
    .filter(url => typeof url === 'string' && url.length > 0 && !url.startsWith('uploading'));


  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar">
       <div className="relative">
            <div ref={heroImageContainerRef} className={`w-full h-64 md:h-80 relative group/imgcontrol bg-slate-200 dark:bg-slate-700 ${isEditing && groundForDisplay.imageUrl ? 'cursor-grab active:cursor-grabbing' : ''}`}
                 {...(isEditing && groundForDisplay.imageUrl ? dragHandlers : {})}>
                 {groundForDisplay.imageUrl ? (
                    <img src={groundForDisplay.imageUrl} alt={groundForDisplay.name} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: `50% ${currentImageObjectPositionY}%` }} />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center"><GroundStockIcon className={`w-32 h-32 text-${moduleConfig.baseColorClass}-400 dark:text-${moduleConfig.baseColorClass}-500`} /></div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </div>

            {isCompactView && !isEditing && (
                <button type="button" onClick={onDeselect} className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10" aria-label="Back to list"><ChevronLeftIcon className="w-6 h-6" /></button>
            )}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                {isEditing && <button type="button" onClick={handleDelete} className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"><TrashIcon className="w-5 h-5" /></button>}
                {!isEditing ? (<button type="button" onClick={() => setIsEditing(true)} className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg"><PencilIcon className="w-5 h-5" /></button>) 
                : (<div className="flex space-x-2"><button type="button" onClick={handleSave} className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg"><CheckIcon className="w-5 h-5" /></button><button type="button" onClick={handleCancel} className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"><XMarkIcon className="w-5 h-5" /></button></div>)}
            </div>
            {isEditing && (<div className="absolute bottom-4 right-4 z-20 flex space-x-2">
                <button type="button" onClick={handleAiGenerateImage} disabled={isLoadingAiImage} className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg"><OutlineSparklesIcon className="w-5 h-5" /></button>
                <input type="file" accept="image/*" ref={heroImageInputRef} onChange={handleImageFileChange} className="hidden" />
                <button type="button" onClick={() => heroImageInputRef.current?.click()} className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full shadow-lg"><PhotoIcon className="w-5 h-5" /></button>
            </div>)}

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <EditableText currentValue={groundForDisplay.name} onSave={val => handleDataFieldChange('name', val)} labelText="" textClassName="text-3xl md:text-4xl font-bold text-white shadow-lg" inputFieldClass="text-3xl md:text-4xl font-bold" disabled={!isEditing} />
                <EditableText currentValue={groundForDisplay.description} onSave={val => handleDataFieldChange('description', val)} labelText="" textarea textClassName="text-md text-slate-200 mt-1 line-clamp-2" inputFieldClass="text-md" disabled={!isEditing} />
            </div>
        </div>

      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto pb-24">
        <SectionCard title="Ground Details" icon={MapIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{GROWING_GROUND_LABELS.type}</label>
                    {isEditing ? (
                        <select 
                            value={groundForDisplay.type}
                            onChange={e => handleDataFieldChange('type', e.target.value)}
                            className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                        >
                            {GROUND_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    ) : (
                        <p className="text-sm p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg min-h-[2.5em] flex items-center">{groundForDisplay.type}</p>
                    )}
                 </div>
                <EditableText currentValue={groundForDisplay.areaDimensions || ''} onSave={val => handleDataFieldChange('areaDimensions', val)} labelText={GROWING_GROUND_LABELS.areaDimensions} disabled={!isEditing} textSize="text-sm" />
            </div>
        </SectionCard>
        <SectionCard title="Environment" icon={SunIcon}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableText currentValue={String(groundForDisplay.lightHoursMorning)} onSave={val => handleDataFieldChange('lightHoursMorning', Number(val))} labelText={GROWING_GROUND_LABELS.lightHoursMorning} disabled={!isEditing} textSize="text-sm" />
                <EditableText currentValue={String(groundForDisplay.lightHoursAfternoon)} onSave={val => handleDataFieldChange('lightHoursAfternoon', Number(val))} labelText={GROWING_GROUND_LABELS.lightHoursAfternoon} disabled={!isEditing} textSize="text-sm" />
                <EditableText currentValue={groundForDisplay.soilType} onSave={val => handleDataFieldChange('soilType', val)} labelText={GROWING_GROUND_LABELS.soilType} disabled={!isEditing} textSize="text-sm" />
                <EditableText currentValue={groundForDisplay.customSoilDescription || ''} onSave={val => handleDataFieldChange('customSoilDescription', val)} labelText={GROWING_GROUND_LABELS.customSoilDescription} textarea disabled={!isEditing} textSize="text-sm" />
            </div>
        </SectionCard>

        <SectionCard title="Plants in this Ground" icon={SquaresPlusIcon} actionButton={<button type="button" onClick={() => onOpenAddPlantToGroundModal(initialGround.id)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><PlusIcon className="w-5 h-5"/></button>}>
            {(groundForDisplay.plants || []).length > 0 ? (
                <div className="space-y-3">{(groundForDisplay.plants || []).map((p, i) => <PlantInGroundCard key={p.plantId + i} plantInGround={p} allPlants={plants} isEditing={isEditing} onRemove={() => handleRemovePlantFromGround(i)} />)}</div>
            ) : (<p className="text-slate-500 dark:text-slate-400 text-sm italic">No plants added yet.</p>)}
        </SectionCard>

        <SectionCard title="Activity Log" icon={ChartBarIcon} actionButton={<button type="button" onClick={() => onOpenAddLogEntryModal(initialGround.id)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><PlusIcon className="w-5 h-5"/></button>}>
            <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {sortedLogs.length > 0 ? sortedLogs.map(log => {
                    const LogIcon = GROUND_LOG_ACTION_TYPE_ICONS[log.actionType] || TagIcon;
                    return (
                        <li key={log.id} className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <LogIcon className={`w-5 h-5 mr-3 mt-0.5 text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-400 flex-shrink-0`}/>
                            <div>
                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{log.actionType}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{new Date(log.timestamp).toLocaleString()}</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{log.description}</p>
                            </div>
                        </li>
                    );
                }) : <p className="text-slate-500 dark:text-slate-400 text-sm italic">No log entries yet.</p>}
            </ul>
        </SectionCard>
        
        {photoGalleryImages.length > 0 && (
            <SectionCard title="Photo Gallery" icon={PhotoIcon}>
                <ImageCarousel images={photoGalleryImages.map(url => ({ url, alt: 'Activity log image' }))} />
            </SectionCard>
        )}

         <SectionCard title="Calendar Tasks" icon={CalendarDaysIcon} actionButton={
            <div className="flex items-center space-x-2">
                 <button type="button" onClick={() => onAiGenerateGroundTasks(initialGround.id)} disabled={isLoadingAiForGroundTasks} className={`p-1.5 rounded-full text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-800`}><OutlineSparklesIcon className="w-5 h-5"/></button>
                 <button type="button" onClick={() => onOpenAddGroundCalendarTaskModal(initialGround.id)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><PlusIcon className="w-5 h-5"/></button>
            </div>}>
             <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {pendingTasks.length > 0 ? pendingTasks.map(task => {
                    const TaskIcon = GROUND_LOG_ACTION_TYPE_ICONS[task.actionType] || TagIcon;
                    const isUpdatingThisTask = updatingTaskId === task.id;
                    return (
                        <li key={task.id} className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                           <div className="flex items-center pt-0.5">
                                <input type="checkbox" checked={task.status === 'Completed'} onChange={(e) => handleTaskCheckboxChange(task.id, e.target.checked ? 'Completed' : 'Pending')} disabled={isUpdatingThisTask} className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50" />
                                {isUpdatingThisTask 
                                    ? <LoadingSpinner size="sm" color="text-emerald-500" /> 
                                    : <TaskIcon className={`w-5 h-5 ml-3 mr-3 text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-400 flex-shrink-0`}/>
                                }
                           </div>
                            <div className="flex-grow">
                                <p className={`font-semibold text-sm ${task.status === 'Completed' ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{task.description}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{new Date(task.dueDate + "T00:00:00").toLocaleDateString()}</p>
                            </div>
                            {isEditing && <button type="button" onClick={() => onDeleteGroundTask(initialGround.id, task.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>}
                        </li>
                    );
                }) : <p className="text-slate-500 dark:text-slate-400 text-sm italic">No pending tasks.</p>}
            </ul>
             {completedTasks.length > 0 && (
                <div className="mt-4">
                    <button type="button" onClick={() => setShowTaskArchive(!showTaskArchive)} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center">
                        <ArchiveBoxIcon className="w-4 h-4 mr-1"/>
                        {showTaskArchive ? 'Hide' : 'Show'} Archived Tasks ({completedTasks.length})
                    </button>
                    {showTaskArchive && (
                        <ul className="space-y-3 mt-2 max-h-60 overflow-y-auto custom-scrollbar pr-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                            {completedTasks.map(task => (
                                <li key={task.id} className="flex items-start p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg opacity-70">
                                    <input type="checkbox" checked={true} onChange={(e) => handleTaskCheckboxChange(task.id, e.target.checked ? 'Completed' : 'Pending')} className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-emerald-600 focus:ring-emerald-500 mt-0.5" />
                                    <div className="ml-3 flex-grow">
                                        <p className="font-medium text-sm line-through text-slate-500 dark:text-slate-400">{task.description}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Completed: {new Date(task.dueDate + "T00:00:00").toLocaleDateString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
             )}
        </SectionCard>

        <SectionCard title="Notes & Sources" icon={ChatBubbleBottomCenterTextIcon}>
            <EditableText currentValue={groundForDisplay.customNotes || ''} onSave={val => handleDataFieldChange('customNotes', val)} labelText="Custom Notes" textarea disabled={!isEditing} textSize="text-sm" />
            <EditableText currentValue={groundForDisplay.informationSources || ''} onSave={val => handleDataFieldChange('informationSources', val)} labelText="Information Sources" textarea disabled={!isEditing} textSize="text-sm" />
        </SectionCard>
      </div>
    </div>
  );
};

export default GrowingGroundDetailView;
