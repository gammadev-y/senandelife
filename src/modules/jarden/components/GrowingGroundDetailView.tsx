
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { GrowingGround, Plant, GroundLogEntry, GrowingGroundPlant, PlantStage, CalendarEventViewModel } from '../types';
import { GROWING_GROUND_LABELS, GROUND_LOG_ACTION_TYPE_ICONS, MODULES, GROUND_TYPES, PLANT_STAGES } from '../constants';
import SectionCard from './SectionCard';
import EditableText from './EditableText';
import { SunIcon, BeakerIcon, ListBulletIcon, PlusIcon, PhotoIcon, CalendarDaysIcon, PencilIcon, SparklesIcon as OutlineSparklesIcon, CheckIcon, TrashIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon, ArrowPathIcon, XMarkIcon, InformationCircleIcon, TagIcon, SquaresPlusIcon, ChartBarIcon, MapIcon, ChatBubbleBottomCenterTextIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';
import LoadingSpinner from './LoadingSpinner';
import { generateGroundImageWithAi } from '../services/geminiService';
import GroundStockIcon from './icons/GroundStockIcon';
import PlantStockIcon from './icons/PlantStockIcon';
import useImageDragAdjust from '../hooks/useImageDragAdjust';
import { deepMerge } from '../utils/objectUtils';
import ImageCarousel from './ImageCarousel';
import UpdatePlantStageModal from './UpdatePlantStageModal';
import { useAuth } from '../../../../context/AuthContext';

interface GrowingGroundDetailViewProps {
  ground: GrowingGround | null;
  onUpdateGround: (groundId: string, updatedData: Partial<GrowingGround>) => void;
  onDeleteGround: (groundId: string) => void;
  setAppError: (error: string | null) => void;
  plants: Plant[];
  onOpenAddLogEntryModal: (groundId: string) => void;
  onOpenAddPlantToGroundModal: (groundId: string) => void;
  onOpenAddEventForGround: (groundId: string) => void;
  onAiGenerateGroundTasks: (groundId: string) => Promise<void>;
  isLoadingAiForGroundTasks: boolean;
  onUpdateCalendarEvent: (eventId: string, updates: Partial<CalendarEventViewModel>) => void;
  onDeleteCalendarEvent: (eventId: string) => void;
  calendarEvents: CalendarEventViewModel[];
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
}

const PlantInGroundCard: React.FC<{ plantInGround: GrowingGroundPlant; allPlants: Plant[]; isEditing: boolean; onRemove: () => void; onUpdateStageClick: (plant: GrowingGroundPlant) => void; }> = ({ plantInGround, allPlants, isEditing, onRemove, onUpdateStageClick }) => {
    const { user } = useAuth();
    const plantInfo = allPlants.find(p => p.id === plantInGround.plantId);
    if (!plantInfo) return null;
    const currentStage = plantInGround.stageLog?.[plantInGround.stageLog.length - 1]?.stage || 'N/A';

    return (
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 flex items-start space-x-3 group/plant relative">
            <button onClick={() => user && onUpdateStageClick(plantInGround)} disabled={!user} className="absolute inset-0 z-10" aria-label={`Update stage for ${plantInfo.plant_identification_overview.common_names[0]}`}></button>
            <img src={plantInfo.display_image_url || undefined} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden');}}  alt={plantInfo.plant_identification_overview.common_names[0]} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
            <div className={`w-16 h-16 rounded-md bg-slate-200 dark:bg-slate-600 items-center justify-center flex-shrink-0 hidden`}>
                <PlantStockIcon className="w-10 h-10 text-slate-400"/>
            </div>
            <div className="flex-grow">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{plantInfo.plant_identification_overview.common_names[0]}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Qty: {plantInGround.quantity} | Stage: <span className="font-medium">{currentStage}</span></p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plantInGround.notes}</p>
            </div>
             {user && isEditing && (
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(); }} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full opacity-0 group-hover/plant:opacity-100 transition-opacity z-20" aria-label={`Remove ${plantInfo.plant_identification_overview.common_names[0]}`}>
                    <TrashIcon className="w-4 h-4"/>
                </button>
            )}
        </div>
    );
};

const GrowingGroundDetailView: React.FC<GrowingGroundDetailViewProps> = ({
  ground: initialGround, onUpdateGround, onDeleteGround, setAppError, plants,
  onOpenAddLogEntryModal, onOpenAddPlantToGroundModal,
  onOpenAddEventForGround, onAiGenerateGroundTasks, isLoadingAiForGroundTasks,
  onUpdateCalendarEvent, onDeleteCalendarEvent, calendarEvents, moduleConfig, onDeselect, isCompactView
}) => {
  const { user } = useAuth();
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGroundData, setEditedGroundData] = useState<GrowingGround | null>(null);
  const [isLoadingAiImage, setIsLoadingAiImage] = useState(false);
  const [showTaskArchive, setShowTaskArchive] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [plantToUpdate, setPlantToUpdate] = useState<GrowingGroundPlant | null>(null);
  
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
    setIsEditing(false);
  }, [initialGround]);

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
        }));
    }
  };

  const handleSavePlantStage = async (plantId: string, { newStage, comment, photoBase64 }: { newStage: PlantStage; comment?: string; photoBase64?: string | null; }) => {
      if (!initialGround) return;
  
      const updatedGround = produce(initialGround, draft => {
          const plantIndex = draft.plants.findIndex(p => p.plantId === plantId);
          if (plantIndex > -1) {
              const plantToUpdate = draft.plants[plantIndex];
              if (!plantToUpdate.stageLog) {
                  plantToUpdate.stageLog = [];
              }
              plantToUpdate.stageLog.push({ stage: newStage, date: new Date().toISOString().split('T')[0] });
          }
  
          if (comment || photoBase64) {
              if (!draft.logs) {
                  draft.logs = [];
              }
              const plantInfo = plants.find(p => p.id === plantId);
              const newLogEntry: GroundLogEntry = {
                  id: crypto.randomUUID(),
                  timestamp: new Date().toISOString(),
                  actionType: 'Stage Update',
                  description: `Stage for ${plantInfo?.plant_identification_overview.common_names[0] || 'plant'} updated to ${newStage}. ${comment || ''}`.trim(),
                  relatedPlantIds: [plantId],
                  photoUrls: photoBase64 ? [photoBase64] : undefined,
                  notes: comment,
              };
              draft.logs.unshift(newLogEntry); // Add to the top of the logs
          }
      });
  
      await onUpdateGround(initialGround.id, updatedGround);
      setPlantToUpdate(null); // Close modal
  };

  const handleTaskCheckboxChange = async (taskId: string, isCompleted: boolean) => {
    if (!initialGround) return;
    setUpdatingTaskId(taskId);
    try {
      await onUpdateCalendarEvent(taskId, { is_completed: isCompleted });
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
  
  const groundCalendarEvents = calendarEvents.filter(event => event.related_entry_id === groundForDisplay.id || event.ground_ids?.includes(groundForDisplay.id));
  const pendingTasks = groundCalendarEvents.filter(t => t.status !== 'Completed').sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  const completedTasks = groundCalendarEvents.filter(t => t.status === 'Completed').sort((a,b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  
  const photoGalleryImages = sortedLogs
    .flatMap(log => log.photoUrls || [])
    .filter(url => typeof url === 'string' && url.length > 0 && !url.startsWith('uploading'));

  const plantToUpdateInfo = plantToUpdate ? plants.find(p => p.id === plantToUpdate.plantId) : null;


  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar">
       <div className="relative">
            <div ref={heroImageContainerRef} className={`w-full h-64 md:h-80 relative group/imgcontrol bg-slate-200 dark:bg-slate-700 ${user && isEditing && groundForDisplay.imageUrl ? 'cursor-grab active:cursor-grabbing' : ''}`}
                 {...(user && isEditing && groundForDisplay.imageUrl ? dragHandlers : {})}>
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
            {user && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    {isEditing && <button type="button" onClick={handleDelete} className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"><TrashIcon className="w-5 h-5" /></button>}
                    {!isEditing ? (<button type="button" onClick={() => setIsEditing(true)} className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg"><PencilIcon className="w-5 h-5" /></button>) 
                    : (<div className="flex space-x-2"><button type="button" onClick={handleSave} className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg"><CheckIcon className="w-5 h-5" /></button><button type="button" onClick={handleCancel} className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"><XMarkIcon className="w-5 h-5" /></button></div>)}
                </div>
            )}
            {user && isEditing && (<div className="absolute bottom-4 right-4 z-20 flex space-x-2">
                <button type="button" onClick={handleAiGenerateImage} disabled={isLoadingAiImage} className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg"><OutlineSparklesIcon className="w-5 h-5" /></button>
                <input type="file" accept="image/*" ref={heroImageInputRef} onChange={handleImageFileChange} className="hidden" />
                <button type="button" onClick={() => heroImageInputRef.current?.click()} className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full shadow-lg"><PhotoIcon className="w-5 h-5" /></button>
            </div>)}

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <EditableText currentValue={groundForDisplay.name} onSave={val => handleDataFieldChange('name', val)} labelText="" textClassName="text-3xl md:text-4xl font-bold text-white shadow-lg" inputFieldClass="text-3xl md:text-4xl font-bold" disabled={!isEditing || !user} />
                <EditableText currentValue={groundForDisplay.description} onSave={val => handleDataFieldChange('description', val)} labelText="" textarea textClassName="text-md text-slate-200 mt-1 line-clamp-2" inputFieldClass="text-md" disabled={!isEditing || !user} />
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
                            disabled={!user}
                        >
                            {GROUND_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    ) : (
                        <p className="text-sm p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg min-h-[2.5em] flex items-center">{groundForDisplay.type}</p>
                    )}
                 </div>
                <EditableText currentValue={groundForDisplay.areaDimensions || ''} onSave={val => handleDataFieldChange('areaDimensions', val)} labelText={GROWING_GROUND_LABELS.areaDimensions} disabled={!isEditing || !user} textSize="text-sm" />
            </div>
        </SectionCard>
        
        <SectionCard title="Environment" icon={SunIcon}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableText currentValue={String(groundForDisplay.lightHoursMorning)} onSave={val => handleDataFieldChange('lightHoursMorning', Number(val))} labelText={GROWING_GROUND_LABELS.lightHoursMorning} disabled={!isEditing || !user} textSize="text-sm" />
                <EditableText currentValue={String(groundForDisplay.lightHoursAfternoon)} onSave={val => handleDataFieldChange('lightHoursAfternoon', Number(val))} labelText={GROWING_GROUND_LABELS.lightHoursAfternoon} disabled={!isEditing || !user} textSize="text-sm" />
                <EditableText currentValue={groundForDisplay.soilType} onSave={val => handleDataFieldChange('soilType', val)} labelText={GROWING_GROUND_LABELS.soilType} disabled={!isEditing || !user} textSize="text-sm" />
                <EditableText currentValue={groundForDisplay.customSoilDescription || ''} onSave={val => handleDataFieldChange('customSoilDescription', val)} labelText={GROWING_GROUND_LABELS.customSoilDescription} textarea disabled={!isEditing || !user} textSize="text-sm" />
            </div>
        </SectionCard>
        
        <SectionCard title="Plants in this Ground" icon={SquaresPlusIcon} actionButton={user && <button type="button" onClick={() => onOpenAddPlantToGroundModal(initialGround.id)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><PlusIcon className="w-5 h-5"/></button>}>
            {(groundForDisplay.plants || []).length > 0 ? (
                <div className="space-y-3">{(groundForDisplay.plants || []).map((p, i) => <PlantInGroundCard key={p.plantId + i} plantInGround={p} allPlants={plants} isEditing={isEditing} onRemove={() => handleRemovePlantFromGround(i)} onUpdateStageClick={() => setPlantToUpdate(p)} />)}</div>
            ) : (<p className="text-slate-500 dark:text-slate-400 text-sm italic">No plants added yet.</p>)}
        </SectionCard>
        
        <SectionCard title="Calendar Tasks" icon={CalendarDaysIcon} actionButton={ user &&
            <div className="flex items-center space-x-2">
                <button type="button" onClick={() => onAiGenerateGroundTasks(initialGround.id)} disabled={isLoadingAiForGroundTasks} className={`p-1.5 rounded-full text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-800`}>
                    {isLoadingAiForGroundTasks ? <LoadingSpinner size="sm" color="text-sky-500" /> : <OutlineSparklesIcon className="w-5 h-5"/>}
                </button>
                <button type="button" onClick={() => onOpenAddEventForGround(initialGround.id)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><PlusIcon className="w-5 h-5"/></button>
            </div>}>
             <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {pendingTasks.length > 0 ? pendingTasks.map(task => {
                    const isUpdatingThisTask = updatingTaskId === task.id;
                    return (
                        <li key={task.id} className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                           <div className="flex items-center pt-0.5">
                                <input type="checkbox" checked={task.is_completed} onChange={(e) => handleTaskCheckboxChange(task.id, e.target.checked)} disabled={isUpdatingThisTask || !user} className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50" />
                                {isUpdatingThisTask 
                                    ? <LoadingSpinner size="sm" color="text-emerald-500" /> 
                                    : <span className="w-5 h-5 ml-3 mr-3 text-lg flex items-center justify-center flex-shrink-0">{task.event_types?.icon_name || '📝'}</span>
                                }
                           </div>
                            <div className="flex-grow">
                                <p className={`font-semibold text-sm ${task.is_completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{task.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{new Date(task.start_date).toLocaleDateString()}</p>
                            </div>
                            {user && isEditing && <button type="button" onClick={() => onDeleteCalendarEvent(task.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>}
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
                                    <input type="checkbox" checked={true} onChange={(e) => user && handleTaskCheckboxChange(task.id, e.target.checked)} disabled={!user} className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-emerald-600 focus:ring-emerald-500 mt-0.5" />
                                    <div className="ml-3 flex-grow">
                                        <p className="font-medium text-sm line-through text-slate-500 dark:text-slate-400">{task.title}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Completed: {new Date(task.start_date).toLocaleDateString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
             )}
        </SectionCard>
        
        <SectionCard title="Activity Log" icon={ChartBarIcon} actionButton={user && <button type="button" onClick={() => onOpenAddLogEntryModal(initialGround.id)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><PlusIcon className="w-5 h-5"/></button>}>
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
        
        <SectionCard title="Notes & Sources" icon={ChatBubbleBottomCenterTextIcon}>
            <EditableText currentValue={groundForDisplay.customNotes || ''} onSave={val => handleDataFieldChange('customNotes', val)} labelText="Custom Notes" textarea disabled={!isEditing || !user} textSize="text-sm" />
            <EditableText currentValue={groundForDisplay.informationSources || ''} onSave={val => handleDataFieldChange('informationSources', val)} labelText="Information Sources" textarea disabled={!isEditing || !user} textSize="text-sm" />
        </SectionCard>
      </div>

      {plantToUpdate && plantToUpdateInfo && (
        <UpdatePlantStageModal
          isOpen={!!plantToUpdate}
          onClose={() => setPlantToUpdate(null)}
          onSave={handleSavePlantStage}
          plantInGround={plantToUpdate}
          plantInfo={plantToUpdateInfo}
          moduleConfig={moduleConfig}
        />
      )}

    </div>
  );
};

export default GrowingGroundDetailView;