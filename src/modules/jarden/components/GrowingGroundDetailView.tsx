
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { GrowingGround, Plant, GroundLogEntry, GrowingGroundPlant, PlantStage, CalendarEventViewModel } from '../types';
import { GROWING_GROUND_LABELS, GROUND_LOG_ACTION_TYPE_ICONS, MODULES, GROUND_TYPES, PLANT_STAGES } from '../constants';
import SectionCard from './SectionCard';
import EditableText from './EditableText';
import { SunIcon, PlusIcon, PhotoIcon, CalendarDaysIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChartBarIcon, MapIcon, ChatBubbleBottomCenterTextIcon, FireIcon, TagIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';
import LoadingSpinner from './LoadingSpinner';
import { generateGroundImageWithAi } from '../services/geminiService';
import GroundStockIcon from './icons/GroundStockIcon';
import PlantStockIcon from './icons/PlantStockIcon';
import useImageDragAdjust from '../hooks/useImageDragAdjust';
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

type ActiveTab = 'details' | 'plants' | 'tasks' | 'log' | 'gallery';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editableGround, setEditableGround] = useState<GrowingGround | null>(null);
  const [isLoadingAiImage, setIsLoadingAiImage] = useState(false);
  const [plantToUpdate, setPlantToUpdate] = useState<GrowingGroundPlant | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [showTaskArchive, setShowTaskArchive] = useState(false);
  
  const prevGroundId = useRef<string | undefined>();
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const heroImageContainerRef = useRef<HTMLDivElement>(null);
  
  const currentImageObjectPositionY = (editableGround?.image_object_position_y) ?? 50;
  
  const { dragHandlers } = useImageDragAdjust({
    initialPosition: currentImageObjectPositionY,
    onPositionChange: (newPosition) => {
      if (isEditing && editableGround) {
        setEditableGround(produce(draft => { if (draft) draft.image_object_position_y = newPosition; }));
      }
    },
    imageContainerRef: heroImageContainerRef,
  });

  useEffect(() => {
    if (initialGround?.id !== prevGroundId.current) {
        setActiveTab('details');
        setIsEditing(false);
        setIsFabMenuOpen(false);
    }
    if (!isEditing) {
        setEditableGround(initialGround ? JSON.parse(JSON.stringify(initialGround)) : null);
    }
    prevGroundId.current = initialGround?.id;
  }, [initialGround, isEditing]);

  const handleDataFieldChange = useCallback((path: string, value: any) => {
    if (!isEditing || !editableGround) return;
    setEditableGround(produce(draft => {
        if(!draft) return;
        let current: any = draft;
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) {
            if (current[keys[i]] === undefined || current[keys[i]] === null) {
                current[keys[i]] = {}; // Create nested object if it doesn't exist
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }));
  }, [isEditing, editableGround]);
  
  const handleAiGenerateImage = async () => {
    if (!editableGround) return;
    const safePlants = editableGround.plants || [];
    const plantNames = safePlants.map(p => plants.find(pl => pl.id === p.plantId)?.plant_identification_overview.common_names[0] || 'plant').filter(Boolean);
    if(plantNames.length === 0) { setAppError("Add plants to this ground before generating an AI image."); return; }

    setIsLoadingAiImage(true);
    setAppError(null);
    try {
      const generatedBase64Image = await generateGroundImageWithAi(plantNames);
      if (generatedBase64Image) {
        setEditableGround(produce(draft => { if(draft) { draft.imageUrl = generatedBase64Image; draft.image_object_position_y = 50; }}));
      } else {
        setAppError("AI image generation did not return an image.");
      }
    } catch (err) {
      setAppError(err instanceof Error ? err.message : "Failed to generate image with AI.");
    } finally {
      setIsLoadingAiImage(false);
    }
  };
  
  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing && event.target.files?.[0] && editableGround) {
      try {
        const file = event.target.files[0];
        const compressedFile = await compressFileBeforeUpload(file);
        const base64 = await convertFileToBase64(compressedFile);
        setEditableGround(produce(draft => { if(draft) { draft.imageUrl = base64; draft.image_object_position_y = 50; }}));
      } catch (err) {
        setAppError(err instanceof Error ? err.message : 'Image processing failed.');
      }
    }
  };


  const handleSave = () => {
    if (editableGround && initialGround) {
        onUpdateGround(initialGround.id, editableGround);
    }
    setIsEditing(false);
    setIsFabMenuOpen(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditableGround(initialGround ? JSON.parse(JSON.stringify(initialGround)) : null);
  };

  const handleDelete = () => {
    if (initialGround && window.confirm(`Are you sure you want to delete "${initialGround.name}"? This action cannot be undone.`)) {
      onDeleteGround(initialGround.id);
    }
  };
  
  const handleRemovePlantFromGround = (indexToRemove: number) => {
    if (isEditing && editableGround) {
        setEditableGround(produce(draft => {
            if (draft?.plants) draft.plants.splice(indexToRemove, 1);
        }));
    }
  };

  const handleSavePlantStage = async (plantId: string, { newStage, comment, photoBase64 }: { newStage: PlantStage; comment?: string; photoBase64?: string | null; }) => {
      if (!initialGround) return;
      const updatedGround = produce(initialGround, draft => {
          const plantIndex = draft.plants.findIndex(p => p.plantId === plantId);
          if (plantIndex > -1) {
              const plantToUpdate = draft.plants[plantIndex];
              if (!plantToUpdate.stageLog) plantToUpdate.stageLog = [];
              plantToUpdate.stageLog.push({ stage: newStage, date: new Date().toISOString().split('T')[0] });
          }
          if (comment || photoBase64) {
              if (!draft.logs) draft.logs = [];
              const plantInfo = plants.find(p => p.id === plantId);
              const newLogEntry: GroundLogEntry = {
                  id: crypto.randomUUID(), timestamp: new Date().toISOString(), actionType: 'Stage Update',
                  description: `Stage for ${plantInfo?.plant_identification_overview.common_names[0] || 'plant'} updated to ${newStage}. ${comment || ''}`.trim(),
                  relatedPlantIds: [plantId], photoUrls: photoBase64 ? [photoBase64] : undefined, notes: comment,
              };
              draft.logs.unshift(newLogEntry);
          }
      });
      await onUpdateGround(initialGround.id, updatedGround);
      setPlantToUpdate(null);
  };

  const handleTaskCheckboxChange = async (taskId: string, isCompleted: boolean) => {
      await onUpdateCalendarEvent(taskId, { is_completed: isCompleted });
  }

  const TABS: { id: ActiveTab, label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'plants', label: 'Plants' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'log', label: 'Log' },
    { id: 'gallery', label: 'Gallery' },
  ];

  const FabSystem = () => {
    if (!user || !initialGround) return null;
  
    if (isEditing) {
      return (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-30 flex gap-4">
          <button onClick={handleCancel} className="w-16 h-16 flex items-center justify-center bg-violet-200 text-violet-800 dark:bg-violet-300 dark:text-violet-900 rounded-2xl shadow-lg hover:bg-violet-300 dark:hover:bg-violet-400 transition-all" aria-label="Cancel">
            <span className="text-2xl" role="img" aria-hidden="true">❌</span>
          </button>
          <button onClick={handleSave} className="w-16 h-16 flex items-center justify-center bg-violet-200 text-violet-800 dark:bg-violet-300 dark:text-violet-900 rounded-2xl shadow-lg hover:bg-violet-300 dark:hover:bg-violet-400 transition-all" aria-label="Save">
            <span className="text-2xl" role="img" aria-hidden="true">✔️</span>
          </button>
        </div>
      );
    }
  
    return (
      <div className="fixed bottom-24 md:bottom-6 right-6 z-30 flex flex-col items-end gap-4">
        {isFabMenuOpen && (
          <div className="flex flex-col items-end gap-4">
            <button onClick={() => { setIsEditing(true); setIsFabMenuOpen(false); }} className="flex items-center gap-3 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-violet-200 dark:hover:bg-violet-300 transition-all">
                <span className="font-medium text-sm">Edit</span> <PencilIcon className="w-5 h-5"/> 
            </button>
            <button onClick={() => { onOpenAddPlantToGroundModal(initialGround.id); setIsFabMenuOpen(false); }} className="flex items-center gap-3 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-violet-200 dark:hover:bg-violet-300 transition-all">
                <span className="font-medium text-sm">Add Plant</span> <PlusIcon className="w-5 h-5"/> 
            </button>
             <button onClick={() => { onOpenAddLogEntryModal(initialGround.id); setIsFabMenuOpen(false); }} className="flex items-center gap-3 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-violet-200 dark:hover:bg-violet-300 transition-all">
                <span className="font-medium text-sm">Add Log</span> <ChartBarIcon className="w-5 h-5"/> 
            </button>
            <button onClick={() => { onOpenAddEventForGround(initialGround.id); setIsFabMenuOpen(false); }} className="flex items-center gap-3 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-violet-200 dark:hover:bg-violet-300 transition-all">
                <span className="font-medium text-sm">Add Task</span> <CalendarDaysIcon className="w-5 h-5"/> 
            </button>
             <button onClick={() => { onAiGenerateGroundTasks(initialGround.id); setIsFabMenuOpen(false); }} disabled={isLoadingAiForGroundTasks} className="flex items-center gap-3 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-violet-200 dark:hover:bg-violet-300 transition-all disabled:opacity-70">
                <span className="font-medium text-sm">AI Tasks</span> {isLoadingAiForGroundTasks ? <LoadingSpinner size="sm" /> : <FireIcon className="w-5 h-5"/>}
            </button>
          </div>
        )}
        <button
          onClick={() => !isLoadingAiForGroundTasks && setIsFabMenuOpen(!isFabMenuOpen)}
          disabled={isLoadingAiForGroundTasks}
          className={`flex items-center justify-center bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition-all duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed ${isFabMenuOpen ? 'w-14 h-14 rounded-full' : 'w-16 h-16 rounded-2xl'}`}
          aria-label={isFabMenuOpen ? 'Close menu' : 'Open actions menu'}
          aria-expanded={isFabMenuOpen}
        >
          {isLoadingAiForGroundTasks ? <LoadingSpinner size="md" color="text-white"/> : <span className="text-2xl transition-transform duration-300 ease-in-out">{isFabMenuOpen ? '✕' : '✨'}</span>}
        </button>
      </div>
    );
  };
  
  if (!initialGround || !editableGround) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        <GroundStockIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">{moduleConfig.name}</h2>
        <p className="text-lg">Select a ground from the list to view its details, or create a new one.</p>
      </div>
    );
  }
  
  const groundForDisplay = editableGround;
  
  const renderTabContent = () => {
      switch (activeTab) {
          case 'details':
              return (
                  <div className="space-y-5">
                      <SectionCard title="Ground Details" icon={MapIcon}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{GROWING_GROUND_LABELS.type}</label>
                                  {isEditing ? (
                                      <select value={groundForDisplay.type} onChange={e => handleDataFieldChange('type', e.target.value)} className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" disabled={!user}>
                                          {GROUND_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                      </select>
                                  ) : (<p className="text-sm p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg min-h-[2.5em] flex items-center">{groundForDisplay.type}</p>)}
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
                      <SectionCard title="Notes & Sources" icon={ChatBubbleBottomCenterTextIcon}>
                          <EditableText currentValue={groundForDisplay.customNotes || ''} onSave={val => handleDataFieldChange('customNotes', val)} labelText="Custom Notes" textarea disabled={!isEditing || !user} textSize="text-sm" />
                          <EditableText currentValue={groundForDisplay.informationSources || ''} onSave={val => handleDataFieldChange('informationSources', val)} labelText="Information Sources" textarea disabled={!isEditing || !user} textSize="text-sm" />
                      </SectionCard>
                       {user && isEditing && (
                            <SectionCard title="Delete Ground" icon={TrashIcon}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-red-500 dark:text-red-400">This action cannot be undone.</p>
                                    <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
                                </div>
                            </SectionCard>
                       )}
                  </div>
              );
          case 'plants':
              return (
                  <SectionCard title="Plants" icon={PlusIcon}>
                      {(groundForDisplay.plants || []).length > 0 ? (
                          <div className="space-y-3">{(groundForDisplay.plants || []).map((p, i) => <PlantInGroundCard key={p.plantId + i} plantInGround={p} allPlants={plants} isEditing={isEditing} onRemove={() => handleRemovePlantFromGround(i)} onUpdateStageClick={setPlantToUpdate} />)}</div>
                      ) : (<p className="text-slate-500 dark:text-slate-400 text-sm italic">No plants added yet.</p>)}
                  </SectionCard>
              );
          case 'tasks':
              const pendingTasks = calendarEvents.filter(t => t.related_entry_id === initialGround.id && t.status !== 'Completed').sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
              const completedTasks = calendarEvents.filter(t => t.related_entry_id === initialGround.id && t.status === 'Completed').sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
              return (
                  <SectionCard title="Tasks" icon={CalendarDaysIcon}>
                      <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                          {pendingTasks.length > 0 ? pendingTasks.map(task => (
                              <li key={task.id} className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                 <input type="checkbox" checked={task.is_completed} onChange={(e) => handleTaskCheckboxChange(task.id, e.target.checked)} disabled={!user} className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-emerald-600 focus:ring-emerald-500 mt-0.5" />
                                 <div className="ml-3">
                                      <p className={`font-semibold text-sm ${task.is_completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{task.title}</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(task.start_date).toLocaleDateString()}</p>
                                 </div>
                              </li>
                          )) : <p className="text-slate-500 dark:text-slate-400 text-sm italic">No pending tasks.</p>}
                      </ul>
                      {completedTasks.length > 0 && (
                        <div className="mt-4"><button onClick={() => setShowTaskArchive(!showTaskArchive)} className="text-xs font-medium text-slate-500 hover:text-slate-700"> {showTaskArchive ? 'Hide' : 'Show'} Archived ({completedTasks.length})</button>
                            {showTaskArchive && <ul className="space-y-3 mt-2">{completedTasks.map(task => <li key={task.id} className="text-sm line-through text-slate-400">{task.title}</li>)}</ul>}
                        </div>
                      )}
                  </SectionCard>
              );
          case 'log':
              const sortedLogs = [...(groundForDisplay.logs || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              return (
                  <SectionCard title="Activity Log" icon={ChartBarIcon}>
                      <ul className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                          {sortedLogs.length > 0 ? sortedLogs.map(log => {
                              const LogIcon = GROUND_LOG_ACTION_TYPE_ICONS[log.actionType] || TagIcon;
                              return (
                                  <li key={log.id} className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                      <LogIcon className={`w-5 h-5 mr-3 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0`}/>
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
              );
          case 'gallery':
              const photoGalleryImages = [...(groundForDisplay.logs || [])].flatMap(log => log.photoUrls || []).filter(url => typeof url === 'string' && url.length > 0 && !url.startsWith('uploading'));
              return (
                  <SectionCard title="Gallery" icon={PhotoIcon}>
                      <ImageCarousel images={photoGalleryImages.map(url => ({ url, alt: 'Activity log image' }))} />
                  </SectionCard>
              );
          default:
              return null;
      }
  };

  const plantInfoForModal = plantToUpdate ? plants.find(p => p.id === plantToUpdate.plantId) : null;

  return (
    <div className="h-full bg-slate-100 dark:bg-slate-900 flex flex-col relative">
      {/* Hero Section */}
      <div className="relative w-full h-72 flex-shrink-0 group">
          <div ref={heroImageContainerRef} className={`w-full h-full relative group/imgcontrol bg-slate-200 dark:bg-slate-700 ${user && isEditing && groundForDisplay.imageUrl ? 'cursor-grab active:cursor-grabbing' : ''}`} {...(user && isEditing && groundForDisplay.imageUrl ? dragHandlers : {})}>
              {groundForDisplay.imageUrl ? (
                  <img src={groundForDisplay.imageUrl} alt={groundForDisplay.name} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: `50% ${currentImageObjectPositionY}%` }} />
              ) : (
                  <div className="w-full h-full flex items-center justify-center"><GroundStockIcon className={`w-32 h-32 text-purple-400 dark:text-purple-500`} /></div>
              )}
          </div>
          
          {isCompactView && onDeselect && !isEditing && (
              <button type="button" onClick={onDeselect} className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10" aria-label="Back to list"><ChevronLeftIcon className="w-6 h-6" /></button>
          )}

           {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => heroImageInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full backdrop-blur-sm hover:bg-white/30">
                        <PhotoIcon className="w-5 h-5"/>
                        Upload Image
                    </button>
                    <input ref={heroImageInputRef} onChange={handleHeroImageUpload} type="file" className="hidden" />
                </div>
            )}

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <EditableText currentValue={groundForDisplay.name} onSave={val => handleDataFieldChange('name', val)} labelText="" textClassName="text-3xl md:text-4xl font-bold [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]" inputFieldClass="text-3xl md:text-4xl font-bold bg-transparent" disabled={!isEditing || !user} />
              <EditableText currentValue={groundForDisplay.description} onSave={val => handleDataFieldChange('description', val)} labelText="" textarea textClassName="text-md text-slate-200 mt-1 line-clamp-2 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]" inputFieldClass="text-md bg-transparent" disabled={!isEditing || !user} />
          </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
          <div className="flex justify-around">
              {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === tab.id ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`}>
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

      {plantToUpdate && plantInfoForModal && (
        <UpdatePlantStageModal isOpen={!!plantToUpdate} onClose={() => setPlantToUpdate(null)} onSave={handleSavePlantStage} plantInGround={plantToUpdate} plantInfo={plantInfoForModal} moduleConfig={moduleConfig}/>
      )}
    </div>
  );
};

export default GrowingGroundDetailView;
