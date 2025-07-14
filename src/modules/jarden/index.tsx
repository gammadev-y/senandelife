



import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Plant, Fertilizer, CompostingMethod, GrowingGround, ActiveModuleType,
    PlantInput, FertilizerInput, CompostingMethodInput, GrowingGroundInput, SeasonalTipInput,
    CustomAiPromptModalData, RecentViewItem, WeatherLocationPreference, SeasonalTip, GroundLogEntry, PlantStage, EventType, CalendarEvent, CalendarEventViewModel, GrowingGroundPlant
} from './types';
import {
    addPlant, updatePlant,
    addFertilizer, updateFertilizer,
    addCompostingMethod, updateCompostingMethod,
    addGrowingGround, updateGrowingGround, deleteGrowingGround,
    addRecentView,
    addSeasonalTip, updateSeasonalTip,
    addCalendarEvent, updateCalendarEvent, deleteCalendarEvent
} from './services/supabaseService';
import { createDefaultPlantStructureInternal } from './utils/plantUtils';
import { getAiAssistedDataForPlant, getAiAssistedDataForPlantSection, generateGroundTasksWithAi } from './services/geminiService';
import { JardenDataProvider, useJardenData } from './context/JardenDataContext';

import AuthPage from './components/AuthPage';
import JardenLayout from './components/JardenLayout';
import AddNewPlantModal from './components/AddNewPlantModal';
import AddNewFertilizerModal from './components/AddNewFertilizerModal';
import AddNewCompostingMethodModal from './components/AddNewCompostingMethodModal';
import AddNewGrowingGroundModal from './components/AddNewGrowingGroundModal';
import AddNewSeasonalTipModal from './components/AddNewSeasonalTipModal';
import CustomAiPromptModal from './components/CustomAiPromptModal';
import AddPlantToGroundModal from './components/AddPlantToGroundModal';
import AddLogEntryModal from './components/AddLogEntryModal';
import AddCalendarEventModal from './components/AddCalendarEventModal';
import LoadingSpinner from './components/LoadingSpinner';
import { MODULES } from './constants';
import DefineLocationModal from './components/DefineLocationModal';
import UpdatePlantStageModal from './components/UpdatePlantStageModal';
import { produce } from 'immer';

type ModalType = 'addPlant' | 'addFertilizer' | 'addCompost' | 'addGround' | 'addTip' | 'customAiPrompt' | 'addPlantToGround' | 'addLogEntry' | 'addEvent' | 'defineLocation' | 'updatePlantStage';

// This is the new main UI component, which consumes the data from the context.
const JardenModuleContent: React.FC = () => {
    const { session, user, profile, signOut, updateProfileData } = useAuth();
    
    // Consume all data and core functions from the new context
    const {
        plants, fertilizers, compostingMethods, growingGrounds, seasonalTips, recentViews,
        eventTypes, calendarEvents,
        plantListItems, seasonalTipListItems, isDataLoading, appError, setAppError, refreshAllData
    } = useJardenData();

    // UI-specific state remains here.
    const [activeModuleId, setActiveModuleId] = useState<ActiveModuleType | 'home' | 'profile' | 'settings'>('home');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [isLoadingAiForGroundTasks, setIsLoadingAiForGroundTasks] = useState(false);
    const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
    const [customAiModalData, setCustomAiModalData] = useState<CustomAiPromptModalData | null>(null);
    const [contextualGroundId, setContextualGroundId] = useState<string | null>(null);
    const [plantToUpdate, setPlantToUpdate] = useState<any | null>(null);

    const prevUser = useRef(user);

    useEffect(() => {
        // If user status changes from logged-out to logged-in, redirect to home.
        if (!prevUser.current && user) {
            setActiveModuleId('home');
        } else if (prevUser.current && !user) {
            // If user logs out, go to a public page
            setActiveModuleId('florapedia');
        }
        prevUser.current = user;
    }, [user]);
    
    const handleModuleNavigation = (newModuleId: ActiveModuleType | 'home' | 'profile' | 'settings') => {
        if (activeModuleId === newModuleId) {
            setSelectedItemId(null); 
        } else {
            setActiveModuleId(newModuleId);
            setSearchTerm('');
            setSelectedItemId(null);
        }
    };

    const handleOpenModalForAdding = () => {
        switch (activeModuleId) {
            case 'florapedia': setModalOpen('addPlant'); break;
            case 'nutribase': setModalOpen('addFertilizer'); break;
            case 'compostcorner': setModalOpen('addCompost'); break;
            case 'growinggrounds': setModalOpen('addGround'); break;
            case 'seasonaltips': setModalOpen('addTip'); break;
            case 'calendar': setModalOpen('addEvent'); break;
            default: console.warn(`No "add new" action for module: ${activeModuleId}`);
        }
    };
    
    const handleItemSelection = useCallback((id: string, itemType: string) => {
        setSelectedItemId(id);
        const itemMap = {
            'plant': plants.find(i => i.id === id),
            'fertilizer': fertilizers.find(i => i.id === id),
            'compost_method': compostingMethods.find(i => i.id === id),
            'growing_ground': growingGrounds.find(g => g.id === id),
            'seasonal_tip': seasonalTips.find(i => i.id === id),
        };
        const item = itemMap[itemType as keyof typeof itemMap];
        const moduleMap = {
            'plant': 'florapedia', 'fertilizer': 'nutribase', 'compost_method': 'compostcorner',
            'growing_ground': 'growinggrounds', 'seasonal_tip': 'seasonaltips'
        }

        if (item && user) { // Only track recent views for logged-in users
            const name = (item as any).name || (item as any).plant_identification_overview?.common_names[0] || (item as any).fertilizer_name || (item as any).method_name || (item as any).title;
            const imageUrl = (item as any).display_image_url || (item as any).imageUrl || (item as any).data?.imageUrl || (item as any).images?.[0]?.url || null;
            addRecentView(id, itemType as any, name, imageUrl, moduleMap[itemType as keyof typeof moduleMap] as ActiveModuleType);
        }
    }, [plants, fertilizers, compostingMethods, growingGrounds, seasonalTips, user]);
    
    const handleAddItem = async <T, U extends { id: string }>(
        item: T,
        addFn: (data: T, userId?: string) => Promise<U>
    ): Promise<U> => {
        if (!user) {
            setAppError("You must be logged in to add new items.");
            throw new Error("You must be logged in to add new items.");
        }
        setAppError(null);
        try {
            const newItem = await addFn(item, user?.id);
            await refreshAllData();
            if (newItem && newItem.id) {
                let itemTypeString = '';
                if (activeModuleId === 'florapedia') itemTypeString = 'plant';
                else if (activeModuleId === 'nutribase') itemTypeString = 'fertilizer';
                else if (activeModuleId === 'compostcorner') itemTypeString = 'compost_method';
                else if (activeModuleId === 'growinggrounds') itemTypeString = 'growing_ground';
                else if (activeModuleId === 'seasonaltips') itemTypeString = 'seasonal_tip';

                if (itemTypeString) {
                    handleItemSelection(newItem.id, itemTypeString);
                }
            }
            return newItem;
        } catch (error: any) {
            let errorMessage = "Failed to save item.";
            if (error.code === '23505' && error.message.includes('flora_pedia_latin_name_scientific_name_key')) {
                 errorMessage = "A plant with this scientific name already exists.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setAppError(errorMessage);
            console.error(error);
            throw new Error(errorMessage);
        }
    };
    
    const handleUpdateItem = async <T, U extends { id: string }>(
        id: string,
        updates: T,
        updateFn: (id: string, updates: T) => Promise<U>
    ) => {
        if (!user) {
            setAppError("You must be logged in to update items.");
            return;
        }
        setAppError(null);
        try {
            await updateFn(id, updates);
            await refreshAllData(); // Refresh after update
        } catch (error) {
            setAppError(error instanceof Error ? error.message : "Failed to update item.");
            console.error(error);
            await refreshAllData(); // Fallback to refresh on error
        }
    };
    
    // Re-bind handlers to use the generic update function
    const handleUpdatePlant = (plantId: string, updates: Partial<Plant>) => handleUpdateItem(plantId, updates, updatePlant);
    const handleUpdateFertilizer = (id: string, updates: Partial<Fertilizer>) => handleUpdateItem(id, updates, updateFertilizer);
    const handleUpdateCompostMethod = (id: string, updates: Partial<CompostingMethod>) => handleUpdateItem(id, updates, updateCompostingMethod);
    const handleUpdateGrowingGround = (id: string, updates: Partial<GrowingGround>) => handleUpdateItem(id, updates, updateGrowingGround);
    const handleUpdateSeasonalTip = (id: string, updates: Partial<SeasonalTipInput>) => handleUpdateItem(id, updates, updateSeasonalTip);
    const handleUpdateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => handleUpdateItem(id, updates, updateCalendarEvent);

    const handleDeleteGrowingGround = async (groundId: string) => {
        try {
            await deleteGrowingGround(groundId);
            setSelectedItemId(null);
            await refreshAllData();
        } catch (error) {
             setAppError(error instanceof Error ? error.message : "Failed to delete growing ground.");
        }
    }
    
    const handleDeleteCalendarEvent = async (eventId: string) => {
        try {
            await deleteCalendarEvent(eventId);
            await refreshAllData();
        } catch (error) {
            setAppError(error instanceof Error ? error.message : "Failed to delete event.");
        }
    }


    const handleAddPlant = (plantInput: PlantInput) => handleAddItem(createDefaultPlantStructureInternal(plantInput), addPlant);
    const handleAddFertilizer = (fertilizerInput: FertilizerInput) => handleAddItem(fertilizerInput, addFertilizer);
    const handleAddCompostMethod = (methodInput: CompostingMethodInput) => handleAddItem(methodInput, addCompostingMethod);
    const handleAddGrowingGround = (groundInput: GrowingGroundInput) => handleAddItem(groundInput, addGrowingGround);
    const handleAddSeasonalTip = (tipInput: SeasonalTipInput) => handleAddItem(tipInput, addSeasonalTip);
    const handleAddCalendarEvent = (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_completed' | 'event_types'>, groundId?: string) => {
        if (!user) { setAppError("Must be logged in to add events."); return Promise.reject("User not logged in"); }
        const fullEventData = { ...eventData, user_id: user.id, is_completed: false };
        return handleAddItem({ event: fullEventData, groundId }, addCalendarEvent as any);
    }

    const onPopulateWithStandardAI = async (plantId: string) => {
        const plant = plants.find(p => p.id === plantId);
        if (!plant) {
            setAppError("Could not find the specified plant to update.");
            return;
        }
    
        setIsLoadingAi(true);
        setAppError(null);
    
        try {
            const plantIdentifier = plant.plant_identification_overview.common_names?.[0] || plant.plant_identification_overview.latin_name_scientific_name;
            const fullAiData = await getAiAssistedDataForPlant(plantIdentifier, plant);
            
            await handleUpdatePlant(plantId, fullAiData);
        } catch (err) {
            setAppError(err instanceof Error ? err.message : "Failed to populate plant data with AI.");
            console.error("AI Population Error:", err);
        } finally {
            setIsLoadingAi(false);
        }
    };

    const handleCustomAiPrompt = async (prompt: string) => {
        if (!customAiModalData) return;
        const { plantId, sectionKey } = customAiModalData;
        const plant = plants.find(p => p.id === plantId);
        if (!plant) return;

        setIsLoadingAi(true);
        try {
            const aiData = await getAiAssistedDataForPlantSection(plant.plant_identification_overview.common_names[0], sectionKey, plant, prompt);
            await handleUpdatePlant(plantId, aiData);
            setModalOpen(null);
        } catch (err) {
            setAppError(err instanceof Error ? err.message : 'AI prompt execution failed.');
        } finally {
            setIsLoadingAi(false);
        }
    };

    const handleUpdateWeatherPreference = async (preference: WeatherLocationPreference) => {
        if (!profile || !user) {
            localStorage.setItem('jardenWeatherPreference', JSON.stringify(preference));
            setModalOpen(null);
            return;
        };
        try {
            await updateProfileData({ preferences: { ...profile.preferences, weather: preference } });
        } catch (err) {
            setAppError(err instanceof Error ? err.message : 'Failed to update weather preference.');
        } finally {
            setModalOpen(null);
        }
    };
    
    const handleAddPlantToGround = async (data: { plantId?: string; newPlantInput?: PlantInput; quantity: number; datePlanted: string; notes?: string; status: PlantStage }) => {
        if (!contextualGroundId) return;
        let plantIdToAdd = data.plantId;
    
        try {
            if (data.newPlantInput) {
                const newPlant = await handleAddItem(createDefaultPlantStructureInternal(data.newPlantInput), addPlant);
                plantIdToAdd = newPlant?.id;
            }
            if (!plantIdToAdd) return;
    
            setModalOpen(null);
            const ground = growingGrounds.find(g => g.id === contextualGroundId);
            if (!ground) return;
    
            const newPlantForGround: GrowingGroundPlant = { 
                plantId: plantIdToAdd, 
                quantity: data.quantity, 
                datePlanted: data.datePlanted, 
                notes: data.notes, 
                stageLog: [{ stage: data.status, date: data.datePlanted }]
            };
            const updatedPlants = [...(ground.plants || []), newPlantForGround];
            await handleUpdateGrowingGround(contextualGroundId, { ...ground, plants: updatedPlants });
        } catch (error) {
            // Error is already set by handleAddItem
            console.error("Failed to add plant to ground:", error);
        }
    };

    const handleAddLogEntry = async (logEntry: Omit<GroundLogEntry, 'id'>) => {
        if (!contextualGroundId) return;
        const ground = growingGrounds.find(g => g.id === contextualGroundId);
        if (!ground) return;
        const newLog = { ...logEntry, id: crypto.randomUUID() };
        const updatedLogs = [newLog, ...(ground.logs || [])];
        setModalOpen(null);
        await handleUpdateGrowingGround(contextualGroundId, { ...ground, logs: updatedLogs });
    };
    
    const handleAiGenerateGroundTasks = async (groundId: string) => {
        const ground = growingGrounds.find(g => g.id === groundId);
        if (!ground || !user) {
            setAppError("Could not find the specified growing ground or user not logged in.");
            return;
        }
    
        setIsLoadingAiForGroundTasks(true);
        setAppError(null);
    
        try {
            const plantDetailsForPrompt = ground.plants
                .map(p => {
                    const plantInfo = plants.find(pl => pl.id === p.plantId);
                    const lastStageLog = p.stageLog && p.stageLog.length > 0 ? p.stageLog[p.stageLog.length - 1] : null;
                    return {
                        plantName: plantInfo?.plant_identification_overview.common_names[0] || 'Unknown Plant',
                        datePlanted: p.datePlanted,
                        currentStage: lastStageLog?.stage || 'N/A',
                        stageUpdatedAt: lastStageLog?.date || 'N/A'
                    };
                })
                .filter(p => p.plantName !== 'Unknown Plant');
    
            if (plantDetailsForPrompt.length === 0) {
                setAppError("Add some plants to the ground before generating tasks.");
                setIsLoadingAiForGroundTasks(false);
                return;
            }
    
            const aiTasks = await generateGroundTasksWithAi(ground.name, plantDetailsForPrompt, eventTypes);
            
            for (const task of aiTasks) {
                 // Find event type with case-insensitive match as a fallback
                const eventType = eventTypes.find(et => et.name.toLowerCase() === task.actionType.toLowerCase()) || eventTypes.find(et => et.name === 'Other');
    
                // Robust date parsing, assuming YYYY-MM-DD from AI. Treats it as a local date.
                const parsedDate = new Date(`${task.dueDate}T00:00:00`);
                if (isNaN(parsedDate.getTime())) {
                    console.warn(`AI returned an invalid date format: "${task.dueDate}". Skipping task: "${task.description}"`);
                    continue; // Skip this task if date is invalid
                }
    
                const eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_completed' | 'event_types'> = {
                    title: task.description,
                    description: `AI-generated task for ${ground.name}`,
                    start_date: parsedDate.toISOString(),
                    end_date: null,
                    event_type_id: eventType?.id || null, // Fallback to Other if still not found
                    is_recurring: false,
                    recurrence_rule: null,
                    related_module: 'growing_grounds',
                    related_entry_id: ground.id
                };
                await addCalendarEvent({ event: { ...eventData, user_id: user.id, is_completed: false }, groundId: ground.id });
            }
            await refreshAllData();
    
        } catch (err) {
            setAppError(err instanceof Error ? err.message : "Failed to generate AI tasks for the ground.");
            console.error(err);
        } finally {
            setIsLoadingAiForGroundTasks(false);
        }
    };

    const handleNavigateToRecentItem = (item: RecentViewItem) => {
        handleModuleNavigation(item.item_module_id);
        handleItemSelection(item.item_id, item.item_type);
    };
    
    const handleSavePlantStage = async (plantId: string, data: { newStage: PlantStage, comment?: string, photoBase64?: string | null }) => {
        const groundWithPlant = growingGrounds.find(g => g.plants.some(p => p.plantId === plantId));
        if (!groundWithPlant) return;
        
        const updatedGround = produce(groundWithPlant, draft => {
            const plantIndex = draft.plants.findIndex(p => p.plantId === plantId);
            if (plantIndex > -1) {
                draft.plants[plantIndex].stageLog.push({ stage: data.newStage, date: new Date().toISOString().split('T')[0] });
            }
            if (data.comment || data.photoBase64) {
                const plantInfo = plants.find(pl => pl.id === plantId);
                draft.logs.unshift({
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    actionType: 'Stage Update',
                    description: `Stage for ${plantInfo?.plant_identification_overview.common_names[0] || 'plant'} updated to ${data.newStage}. ${data.comment || ''}`.trim(),
                    relatedPlantIds: [plantId],
                    photoUrls: data.photoBase64 ? [data.photoBase64] : undefined,
                    notes: data.comment
                });
            }
        });

        await handleUpdateGrowingGround(groundWithPlant.id, updatedGround);
        setModalOpen(null);
        setPlantToUpdate(null);
    };

    const plantInfoForModal = plantToUpdate ? plants.find(p => p.id === plantToUpdate.plantId) : null;


    if (isDataLoading) {
        return <div className="w-full h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><LoadingSpinner size="lg" /><p className="ml-4 text-slate-600 dark:text-slate-300">Loading your Jarden...</p></div>;
    }

    if (!user && (activeModuleId === 'growinggrounds' || activeModuleId === 'calendar' || activeModuleId === 'profile' || activeModuleId === 'settings')) {
        return <AuthPage onLoginSuccess={() => { /* AuthContext will trigger re-render, and useEffect will handle navigation */ }} />;
    }

    return (
        <>
            <JardenLayout
                activeModuleId={activeModuleId}
                onModuleChange={handleModuleNavigation}
                onSearchChange={setSearchTerm}
                searchTerm={searchTerm}
                onAddNew={handleOpenModalForAdding}
                onSignOut={signOut}
                plants={plants}
                plantListItems={plantListItems}
                fertilizers={fertilizers}
                compostingMethods={compostingMethods}
                growingGrounds={growingGrounds}
                seasonalTips={seasonalTips}
                seasonalTipListItems={seasonalTipListItems}
                eventTypes={eventTypes}
                calendarEvents={calendarEvents}
                recentViews={recentViews}
                onItemSelect={handleItemSelection}
                selectedItemId={selectedItemId}
                onDeselect={() => setSelectedItemId(null)}
                appError={appError}
                setAppError={setAppError}
                isLoadingAi={isLoadingAi}
                setIsLoadingAi={setIsLoadingAi}
                onUpdatePlant={handleUpdatePlant}
                onPopulateWithStandardAI={onPopulateWithStandardAI}
                onOpenCustomAiPromptModal={(data) => { setCustomAiModalData(data); setModalOpen('customAiPrompt'); }}
                onUpdateFertilizer={handleUpdateFertilizer}
                onUpdateCompostingMethod={handleUpdateCompostMethod}
                onUpdateGrowingGround={handleUpdateGrowingGround}
                onDeleteGround={handleDeleteGrowingGround}
                onUpdateSeasonalTip={handleUpdateSeasonalTip}
                onOpenAddPlantToGroundModal={(groundId) => { setContextualGroundId(groundId); setModalOpen('addPlantToGround'); }}
                onOpenAddLogEntryModal={(groundId) => { setContextualGroundId(groundId); setModalOpen('addLogEntry'); }}
                onOpenAddEventForGround={(groundId) => { setContextualGroundId(groundId); setModalOpen('addEvent'); }}
                onAiGenerateGroundTasks={handleAiGenerateGroundTasks}
                isLoadingAiForGroundTasks={isLoadingAiForGroundTasks}
                onUpdateCalendarEvent={handleUpdateCalendarEvent}
                onDeleteCalendarEvent={handleDeleteCalendarEvent}
                weatherLocationPreference={profile?.preferences?.weather || null}
                setIsDefineLocationModalOpen={() => setModalOpen('defineLocation')}
                onNavigateToRecentItem={handleNavigateToRecentItem}
            />
            {/* Modals */}
            <AddNewPlantModal isOpen={modalOpen === 'addPlant'} onClose={() => setModalOpen(null)} onSave={handleAddPlant} moduleConfig={MODULES.find(m => m.id === 'florapedia')!} />
            <AddNewFertilizerModal isOpen={modalOpen === 'addFertilizer'} onClose={() => setModalOpen(null)} onSave={handleAddFertilizer} moduleConfig={MODULES.find(m => m.id === 'nutribase')!} />
            <AddNewCompostingMethodModal isOpen={modalOpen === 'addCompost'} onClose={() => setModalOpen(null)} onSave={handleAddCompostMethod} moduleConfig={MODULES.find(m => m.id === 'compostcorner')!} />
            <AddNewGrowingGroundModal isOpen={modalOpen === 'addGround'} onClose={() => setModalOpen(null)} onSave={handleAddGrowingGround} moduleConfig={MODULES.find(m => m.id === 'growinggrounds')!} />
            <AddNewSeasonalTipModal isOpen={modalOpen === 'addTip'} onClose={() => setModalOpen(null)} onSave={handleAddSeasonalTip} moduleConfig={MODULES.find(m => m.id === 'seasonaltips')!} />
            <AddCalendarEventModal isOpen={modalOpen === 'addEvent'} onClose={() => setModalOpen(null)} onSave={handleAddCalendarEvent} eventTypes={eventTypes} moduleConfig={MODULES.find(m => m.id === 'calendar')!} groundId={contextualGroundId || undefined} />

            <DefineLocationModal isOpen={modalOpen === 'defineLocation'} onClose={() => setModalOpen(null)} onPreferenceSelect={handleUpdateWeatherPreference} currentPreference={profile?.preferences?.weather || null} />
            {customAiModalData && <CustomAiPromptModal isOpen={modalOpen === 'customAiPrompt'} onClose={() => setModalOpen(null)} onExecutePrompt={handleCustomAiPrompt} isLoading={isLoadingAi} plantName={customAiModalData.plantName} sectionKey={customAiModalData.sectionKey} moduleConfig={MODULES.find(m => m.id === 'florapedia')!} />}
            {contextualGroundId && user && <AddPlantToGroundModal isOpen={modalOpen === 'addPlantToGround'} onClose={() => setModalOpen(null)} onSave={handleAddPlantToGround} groundId={contextualGroundId} existingPlants={plants} onAddNewPlant={() => { setModalOpen(null); setTimeout(() => setModalOpen('addPlant'), 100); }} moduleConfig={MODULES.find(m => m.id === 'growinggrounds')!} />}
            {contextualGroundId && user && <AddLogEntryModal isOpen={modalOpen === 'addLogEntry'} onClose={() => setModalOpen(null)} onSave={handleAddLogEntry} groundId={contextualGroundId} moduleConfig={MODULES.find(m => m.id === 'growinggrounds')!} />}
            {plantToUpdate && plantInfoForModal && (
                 <UpdatePlantStageModal
                    isOpen={true} // Controlled by plantToUpdate state now
                    onClose={() => setPlantToUpdate(null)}
                    onSave={handleSavePlantStage}
                    plantInGround={plantToUpdate}
                    plantInfo={plantInfoForModal}
                    moduleConfig={MODULES.find(m => m.id === 'growinggrounds')!}
                />
            )}
        </>
    );
};


const JardenModuleWithProvider: React.FC = () => {
    const { loading: authLoading } = useAuth();
    
    if (authLoading) {
        return <div className="w-full h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><LoadingSpinner size="lg" /></div>;
    }

    return (
        <JardenDataProvider>
            <JardenModuleContent />
        </JardenDataProvider>
    );
};

export default JardenModuleWithProvider;
