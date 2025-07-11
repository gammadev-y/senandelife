



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Plant, Fertilizer, CompostingMethod, GrowingGround, ActiveModuleType,
    PlantInput, FertilizerInput, CompostingMethodInput, GrowingGroundInput, SeasonalTipInput,
    CustomAiPromptModalData, CalendarEvent, GroundCalendarTask, RecentViewItem, WeatherLocationPreference, SeasonalTip, UserProfile, GroundLogEntry
} from './types';
import {
    addPlant, updatePlant, getPlants,
    addFertilizer, updateFertilizer, getFertilizers,
    addCompostingMethod, updateCompostingMethod, getCompostingMethods,
    addGrowingGround, updateGrowingGround, getGrowingGrounds, deleteGrowingGround,
    addRecentView, getRecentViews,
    getSeasonalTips, addSeasonalTip, updateSeasonalTip,
    seedInitialData, mapPlantToPlantListItemData, mapSeasonalTipToListItemData
} from './services/supabaseService';
import { createDefaultPlantStructureInternal } from './utils/plantUtils';
import { deepMerge } from './utils/objectUtils';
import { getAiAssistedDataForPlantSection, generateGroundTasksWithAi } from './services/geminiService';
import { produce } from 'immer';

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
import AddGroundCalendarTaskModal from './components/AddGroundCalendarTaskModal';
import { PlantListItemData, SeasonalTipListItemData } from './services/idbServiceTypes';
import LoadingSpinner from './components/LoadingSpinner';
import { MODULES } from './constants';
import DefineLocationModal from './components/DefineLocationModal';

type ModalType = 'addPlant' | 'addFertilizer' | 'addCompost' | 'addGround' | 'addTip' | 'customAiPrompt' | 'addPlantToGround' | 'addLogEntry' | 'addGroundTask' | 'defineLocation';


const JardenModule: React.FC = () => {
    const { session, user, profile, loading: authLoading, signOut, updateProfileData } = useAuth();
    const [activeModuleId, setActiveModuleId] = useState<ActiveModuleType | 'home' | 'profile' | 'settings'>('home');

    const [plants, setPlants] = useState<Plant[]>([]);
    const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
    const [compostingMethods, setCompostingMethods] = useState<CompostingMethod[]>([]);
    const [growingGrounds, setGrowingGrounds] = useState<GrowingGround[]>([]);
    const [seasonalTips, setSeasonalTips] = useState<SeasonalTip[]>([]);
    const [recentViews, setRecentViews] = useState<RecentViewItem[]>([]);

    const plantListItems = useMemo(() => plants.map(mapPlantToPlantListItemData), [plants]);
    const seasonalTipListItems = useMemo(() => seasonalTips.map(mapSeasonalTipToListItemData), [seasonalTips]);

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [appError, setAppError] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    const [isLoadingAiForGroundTasks, setIsLoadingAiForGroundTasks] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
    const [customAiModalData, setCustomAiModalData] = useState<CustomAiPromptModalData | null>(null);
    const [contextualGroundId, setContextualGroundId] = useState<string | null>(null);

    const refreshAllData = useCallback(async (isInitialLoad = false) => {
        if (!user) return;
        if (isInitialLoad) {
            setIsDataLoading(true);
        }
        setAppError(null);
        try {
            if (isInitialLoad) {
                await seedInitialData();
            }
            const [
                plantsData, fertilizersData, compostingMethodsData,
                growingGroundsData, recentViewsData, seasonalTipsData
            ] = await Promise.all([
                getPlants(), getFertilizers(), getCompostingMethods(),
                getGrowingGrounds(), getRecentViews(), getSeasonalTips()
            ]);

            setPlants(plantsData);
            setFertilizers(fertilizersData);
            setCompostingMethods(compostingMethodsData);
            setGrowingGrounds(growingGroundsData);
            setRecentViews(recentViewsData);
            setSeasonalTips(seasonalTipsData);

        } catch (error) {
            console.error("Failed to load data:", error);
            setAppError(error instanceof Error ? error.message : "An unknown error occurred while loading data.");
        } finally {
            if (isInitialLoad) {
                setIsDataLoading(false);
            }
        }
    }, [user, setAppError, setIsDataLoading]);

    useEffect(() => {
        if (session && user) {
            const timeoutId = setTimeout(() => {
                if (isDataLoading) { // Check if it's still loading
                    console.error("Data loading timed out after 20 seconds.");
                    setAppError("Loading your Jarden is taking longer than expected. Please check your connection and refresh.");
                    setIsDataLoading(false); // Stop showing the loading screen
                }
            }, 20000); // 20-second timeout

            refreshAllData(true).finally(() => {
                clearTimeout(timeoutId); // Loading finished, clear the timeout
            });

            return () => {
                clearTimeout(timeoutId); // Cleanup on unmount
            };
        } else {
            setIsDataLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleModuleNavigation = (newModuleId: ActiveModuleType | 'home' | 'profile' | 'settings') => {
        if (activeModuleId === newModuleId) {
            setSelectedItemId(null); // Deselect if clicking the same active module
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
            default: console.warn(`No "add new" action for module: ${activeModuleId}`);
        }
    };

    const handleAddItem = async <T, U>(
        item: T,
        addFn: (data: T, userId?: string) => Promise<U>
    ) => {
        setAppError(null);
        try {
            const newItem = await addFn(item, user?.id);
            await refreshAllData();
            setModalOpen(null);
            if (newItem && (newItem as any).id) {
                let itemTypeString = '';
                if (activeModuleId === 'florapedia') itemTypeString = 'plant';
                else if (activeModuleId === 'nutribase') itemTypeString = 'fertilizer';
                else if (activeModuleId === 'compostcorner') itemTypeString = 'compost_method';
                else if (activeModuleId === 'growinggrounds') itemTypeString = 'growing_ground';
                else if (activeModuleId === 'seasonaltips') itemTypeString = 'seasonal_tip';

                if (itemTypeString) {
                    handleItemSelection((newItem as any).id, itemTypeString);
                }
            }
        } catch (error) {
            setAppError(error instanceof Error ? error.message : "Failed to save item.");
            console.error(error);
        }
    };
    
    const handleUpdateGrowingGround = async (groundId: string, updates: Partial<GrowingGround>) => {
        const originalGrounds = JSON.parse(JSON.stringify(growingGrounds));
        
        setGrowingGrounds(produce(draft => {
            const ground = draft.find(g => g.id === groundId);
            if (ground) {
                Object.assign(ground, updates);
            }
        }));

        try {
            const updatedGroundFromServer = await updateGrowingGround(groundId, updates);
            setGrowingGrounds(produce(draft => {
                const index = draft.findIndex(g => g.id === groundId);
                if (index !== -1) draft[index] = updatedGroundFromServer;
            }));
        } catch (error) {
            setAppError(error instanceof Error ? error.message : "Failed to update ground details.");
            setGrowingGrounds(originalGrounds);
        }
    };


    const handleDeleteGrowingGround = async (groundId: string) => {
        const originalGrounds = JSON.parse(JSON.stringify(growingGrounds));
        setGrowingGrounds(prev => prev.filter(g => g.id !== groundId));
        setSelectedItemId(null);

        try {
            await deleteGrowingGround(groundId);
        } catch (error) {
             setAppError(error instanceof Error ? error.message : "Failed to delete growing ground.");
             setGrowingGrounds(originalGrounds);
        }
    }


    const handleAddPlant = (plantInput: PlantInput) => handleAddItem(createDefaultPlantStructureInternal(plantInput), addPlant);
    const handleAddFertilizer = (fertilizerInput: FertilizerInput) => handleAddItem(fertilizerInput, addFertilizer);
    const handleAddCompostMethod = (methodInput: CompostingMethodInput) => handleAddItem(methodInput, addCompostingMethod);
    const handleAddGrowingGround = (groundInput: GrowingGroundInput) => handleAddItem(groundInput, addGrowingGround);
    const handleAddSeasonalTip = (tipInput: SeasonalTipInput) => handleAddItem(tipInput, addSeasonalTip);

    const handleUpdatePlant = (plantId: string, updates: Partial<Plant>) => handleUpdateItem(plantId, updates, updatePlant);
    const handleUpdateFertilizer = (id: string, updates: Partial<Fertilizer>) => handleUpdateItem(id, updates, updateFertilizer);
    const handleUpdateCompostMethod = (id: string, updates: Partial<CompostingMethod>) => handleUpdateItem(id, updates, updateCompostingMethod);
    const handleUpdateSeasonalTip = (id: string, updates: Partial<SeasonalTipInput>) => handleUpdateItem(id, updates, updateSeasonalTip);
    
    const handleUpdateItem = async <T, U extends { id: string }>(
        id: string,
        updates: T,
        updateFn: (id: string, updates: T) => Promise<U>
    ) => {
        setAppError(null);
        try {
            const updatedItem = await updateFn(id, updates);
            // Instead of full refresh, just update the specific item in state
            if (activeModuleId === 'florapedia') setPlants(prev => prev.map(p => p.id === id ? updatedItem as unknown as Plant : p));
            if (activeModuleId === 'nutribase') setFertilizers(prev => prev.map(f => f.id === id ? updatedItem as unknown as Fertilizer : f));
            if (activeModuleId === 'compostcorner') setCompostingMethods(prev => prev.map(c => c.id === id ? updatedItem as unknown as CompostingMethod : c));
            if (activeModuleId === 'seasonaltips') setSeasonalTips(prev => prev.map(t => t.id === id ? updatedItem as unknown as SeasonalTip : t));
        } catch (error) {
            setAppError(error instanceof Error ? error.message : "Failed to update item.");
            console.error(error);
            await refreshAllData(); // Fallback to refresh on error
        }
    };


    const handlePopulateWithStandardAI = async (plantId: string) => {
        // Logic for standard AI population
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
        if (!profile) return;
        try {
            await updateProfileData({ preferences: { ...profile.preferences, weather: preference } });
        } catch (err) {
            setAppError(err instanceof Error ? err.message : 'Failed to update weather preference.');
        } finally {
            setModalOpen(null);
        }
    };

    const handleAddPlantToGround = async (data: { plantId?: string; newPlantInput?: PlantInput; quantity: number; datePlanted: string; notes?: string; status: any }) => {
        if (!contextualGroundId) return;

        let plantIdToAdd = data.plantId;
        if (data.newPlantInput) {
            const newPlant = await addPlant(createDefaultPlantStructureInternal(data.newPlantInput));
            await refreshAllData(); // Refresh to get the new plant in the main list
            plantIdToAdd = newPlant.id;
        }
        if (!plantIdToAdd) return;

        setModalOpen(null);

        const originalGrounds = JSON.parse(JSON.stringify(growingGrounds));
        const ground = originalGrounds.find((g: GrowingGround) => g.id === contextualGroundId);
        if (!ground) return;

        const newPlantForGround = { plantId: plantIdToAdd, quantity: data.quantity, datePlanted: data.datePlanted, notes: data.notes, status: data.status };
        const updatedPlants = [...(ground.plants || []), newPlantForGround];

        handleUpdateGrowingGround(contextualGroundId, { plants: updatedPlants });
    };

    const handleAddLogEntry = async (logEntry: Omit<GroundLogEntry, 'id'>) => {
        if (!contextualGroundId) return;
        const originalGrounds = JSON.parse(JSON.stringify(growingGrounds));
        const ground = originalGrounds.find((g: GrowingGround) => g.id === contextualGroundId);
        if (!ground) return;

        const newLog = { ...logEntry, id: crypto.randomUUID() };
        const updatedLogs = [newLog, ...(ground.logs || [])];
        
        setModalOpen(null);
        handleUpdateGrowingGround(contextualGroundId, { logs: updatedLogs });
    };

    const handleAddGroundTask = async (taskData: Omit<GroundCalendarTask, 'id' | 'status'>) => {
        if (!contextualGroundId) return;
        const originalGrounds = JSON.parse(JSON.stringify(growingGrounds));
        const ground = originalGrounds.find((g: GrowingGround) => g.id === contextualGroundId);
        if (!ground) return;

        const newTask = { ...taskData, id: crypto.randomUUID(), status: 'Pending' as const };
        const updatedTasks = [...(ground.calendarTasks || []), newTask];
        
        setModalOpen(null);
        handleUpdateGrowingGround(contextualGroundId, { calendarTasks: updatedTasks });
    };

    const handleAiGenerateGroundTasks = async (groundId: string) => {
        const ground = growingGrounds.find(g => g.id === groundId);
        if (!ground || ground.plants.length === 0) {
            setAppError("Cannot generate tasks for a ground with no plants.");
            return;
        }
        setIsLoadingAiForGroundTasks(true);
        try {
            const plantDetails = ground.plants.map(p => {
                const plantInfo = plants.find(pl => pl.id === p.plantId);
                return plantInfo?.plant_identification_overview.common_names[0] || 'unknown plant';
            }).join(', ');

            const suggestedTasks = await generateGroundTasksWithAi(ground.name, plantDetails);
            const newTasks: GroundCalendarTask[] = suggestedTasks.map(task => ({ ...task, id: crypto.randomUUID(), status: 'Pending' }));
            
            handleUpdateGrowingGround(groundId, { calendarTasks: [...(ground.calendarTasks || []), ...newTasks] });

        } catch (err) {
            setAppError(err instanceof Error ? err.message : "AI task generation failed.");
        } finally {
            setIsLoadingAiForGroundTasks(false);
        }
    };

    const handleUpdateGroundTask = (groundId: string, taskId: string, updates: Partial<GroundCalendarTask>) => {
        const ground = growingGrounds.find(g => g.id === groundId);
        if (!ground) return;

        const updatedTasks = (ground.calendarTasks || []).map(task => 
            task.id === taskId ? { ...task, ...updates } : task
        );
        handleUpdateGrowingGround(groundId, { calendarTasks: updatedTasks });
    };

    const handleDeleteGroundTask = (groundId: string, taskId: string) => {
        const ground = growingGrounds.find(g => g.id === groundId);
        if (!ground) return;
        const updatedTasks = (ground.calendarTasks || []).filter(task => task.id !== taskId);
        handleUpdateGrowingGround(groundId, { calendarTasks: updatedTasks });
    };

    const handleItemSelection = useCallback((id: string, itemType: string) => {
        setSelectedItemId(id);
        const itemMap = {
            'plant': plants.find(i => i.id === id),
            'fertilizer': fertilizers.find(i => i.id === id),
            'compost_method': compostingMethods.find(i => i.id === id),
            'growing_ground': growingGrounds.find(i => i.id === id),
            'seasonal_tip': seasonalTips.find(i => i.id === id),
        };
        const item = itemMap[itemType as keyof typeof itemMap];
        const moduleMap = {
            'plant': 'florapedia', 'fertilizer': 'nutribase', 'compost_method': 'compostcorner',
            'growing_ground': 'growinggrounds', 'seasonal_tip': 'seasonaltips'
        }

        if (item) {
            const name = (item as any).name || (item as any).plant_identification_overview?.common_names[0] || (item as any).fertilizer_name || (item as any).method_name || (item as any).title;
            const imageUrl = (item as any).display_image_url || (item as any).data?.imageUrl || (item as any).images?.[0]?.url || null;
            addRecentView(id, itemType as any, name, imageUrl, moduleMap[itemType as keyof typeof moduleMap] as ActiveModuleType);
        }
    }, [plants, fertilizers, compostingMethods, growingGrounds, seasonalTips]);

    const handleNavigateToRecentItem = (item: RecentViewItem) => {
        handleModuleNavigation(item.item_module_id);
        handleItemSelection(item.item_id, item.item_type);
    };

    const handleLoginSuccess = () => {
        refreshAllData(true);
    };

    if (authLoading) {
        return <div className="w-full h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><LoadingSpinner size="lg" /></div>;
    }
    if (!session || !user) {
        return <AuthPage onLoginSuccess={handleLoginSuccess} />;
    }
    if (isDataLoading) {
        return <div className="w-full h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><LoadingSpinner size="lg" /><p className="ml-4 text-slate-600 dark:text-slate-300">Loading your Jarden...</p></div>;
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
                recentViews={recentViews}
                onItemSelect={handleItemSelection}
                selectedItemId={selectedItemId}
                onDeselect={() => setSelectedItemId(null)}
                appError={appError}
                setAppError={setAppError}
                isLoadingAi={isLoadingAi}
                setIsLoadingAi={setIsLoadingAi}
                onUpdatePlant={handleUpdatePlant}
                onPopulateWithStandardAI={handlePopulateWithStandardAI}
                onOpenCustomAiPromptModal={(data) => { setCustomAiModalData(data); setModalOpen('customAiPrompt'); }}
                onUpdateFertilizer={handleUpdateFertilizer}
                onUpdateCompostingMethod={handleUpdateCompostMethod}
                onUpdateGrowingGround={handleUpdateGrowingGround}
                onDeleteGround={handleDeleteGrowingGround}
                onUpdateSeasonalTip={handleUpdateSeasonalTip}
                onOpenAddPlantToGroundModal={(groundId) => { setContextualGroundId(groundId); setModalOpen('addPlantToGround'); }}
                onOpenAddLogEntryModal={(groundId) => { setContextualGroundId(groundId); setModalOpen('addLogEntry'); }}
                onOpenAddGroundCalendarTaskModal={(groundId) => { setContextualGroundId(groundId); setModalOpen('addGroundTask'); }}
                onAiGenerateGroundTasks={handleAiGenerateGroundTasks}
                isLoadingAiForGroundTasks={isLoadingAiForGroundTasks}
                onUpdateGroundTask={handleUpdateGroundTask}
                onDeleteGroundTask={handleDeleteGroundTask}
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
            <DefineLocationModal isOpen={modalOpen === 'defineLocation'} onClose={() => setModalOpen(null)} onPreferenceSelect={handleUpdateWeatherPreference} currentPreference={profile?.preferences?.weather || null} />
            {customAiModalData && <CustomAiPromptModal isOpen={modalOpen === 'customAiPrompt'} onClose={() => setModalOpen(null)} onExecutePrompt={handleCustomAiPrompt} isLoading={isLoadingAi} plantName={customAiModalData.plantName} sectionKey={customAiModalData.sectionKey} moduleConfig={MODULES.find(m => m.id === 'florapedia')!} />}
            {contextualGroundId && <AddPlantToGroundModal isOpen={modalOpen === 'addPlantToGround'} onClose={() => setModalOpen(null)} onSave={handleAddPlantToGround} groundId={contextualGroundId} existingPlants={plants} onAddNewPlant={() => { setModalOpen(null); setTimeout(() => setModalOpen('addPlant'), 100); }} moduleConfig={MODULES.find(m => m.id === 'growinggrounds')!} />}
            {contextualGroundId && <AddLogEntryModal isOpen={modalOpen === 'addLogEntry'} onClose={() => setModalOpen(null)} onSave={handleAddLogEntry} groundId={contextualGroundId} moduleConfig={MODULES.find(m => m.id === 'growinggrounds')!} />}
            {contextualGroundId && <AddGroundCalendarTaskModal isOpen={modalOpen === 'addGroundTask'} onClose={() => setModalOpen(null)} onSave={handleAddGroundTask} groundId={contextualGroundId} plantsInGround={growingGrounds.find(g => g.id === contextualGroundId)?.plants || []} allPlants={plants} moduleConfig={MODULES.find(m => m.id === 'growinggrounds')!} />}
        </>
    );
};

export default JardenModule;