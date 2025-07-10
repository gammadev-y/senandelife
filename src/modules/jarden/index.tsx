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
  addGrowingGround, updateGrowingGround, getGrowingGrounds,
  addRecentView, getRecentViews,
  getSeasonalTips, addSeasonalTip, updateSeasonalTip,
  seedInitialData, mapPlantToPlantListItemData, mapSeasonalTipToListItemData
} from './services/supabaseService';
import { createDefaultPlantStructureInternal } from './utils/plantUtils';
import { deepMerge } from './utils/objectUtils';
import { getAiAssistedDataForPlantSection, generateGroundTasksWithAi } from './services/geminiService';
import { produce } from 'https://esm.sh/immer@10.0.3';

import { MODULES } from './constants';
import { HomeIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon, CogIcon } from '@heroicons/react/24/outline';
import UserAvatar from './components/UserAvatar';
import LoadingSpinner from './components/LoadingSpinner';

import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import PlantListItem from './components/PlantListItem';
import PlantDetailView from './components/PlantDetailView';
import FertilizerListItem from './components/FertilizerListItem';
import FertilizerDetailView from './components/FertilizerDetailView';
import CompostingMethodListItem from './components/CompostingMethodListItem';
import CompostingMethodDetailView from './components/CompostingMethodDetailView';
import GrowingGroundListItem from './components/GrowingGroundListItem';
import GrowingGroundDetailView from './components/GrowingGroundDetailView';
import CalendarView from './components/CalendarView';
import SeasonalTipListItem from './components/SeasonalTipListItem';
import SeasonalTipDetailView from './components/SeasonalTipDetailView';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';

import AddNewPlantModal from './components/AddNewPlantModal';
import AddNewFertilizerModal from './components/AddNewFertilizerModal';
import AddNewCompostingMethodModal from './components/AddNewCompostingMethodModal';
import AddNewGrowingGroundModal from './components/AddNewGrowingGroundModal';
import AddNewSeasonalTipModal from './components/AddNewSeasonalTipModal';
import CustomAiPromptModal from './components/CustomAiPromptModal';
import AddPlantToGroundModal from './components/AddPlantToGroundModal';
import AddLogEntryModal from './components/AddLogEntryModal';
import AddGroundCalendarTaskModal from './components/AddGroundCalendarTaskModal';
import DefineLocationModal from './components/DefineLocationModal';
import { PlantListItemData, SeasonalTipListItemData } from './services/idbServiceTypes';

type ModalType = 'addPlant' | 'addFertilizer' | 'addCompost' | 'addGround' | 'addTip' | 'customAiPrompt' | 'addPlantToGround' | 'addLogEntry' | 'addGroundTask' | 'defineLocation';


const JardenApp: React.FC = () => {
    const { session, user, profile, loading: authLoading, signOut, updateProfileData } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState<ActiveModuleType | 'home' | 'profile' | 'settings'>('home');

    const [plants, setPlants] = useState<Plant[]>([]);
    const [plantListItems, setPlantListItems] = useState<PlantListItemData[]>([]);
    const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
    const [compostingMethods, setCompostingMethods] = useState<CompostingMethod[]>([]);
    const [growingGrounds, setGrowingGrounds] = useState<GrowingGround[]>([]);
    const [seasonalTips, setSeasonalTips] = useState<SeasonalTip[]>([]);
    const [seasonalTipListItems, setSeasonalTipListItems] = useState<SeasonalTipListItemData[]>([]);
    const [recentViews, setRecentViews] = useState<RecentViewItem[]>([]);
    
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [appError, setAppError] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    
    const [isLoadingAiForGroundTasks, setIsLoadingAiForGroundTasks] = useState(false);

    const [modalOpen, setModalOpen] = useState<ModalType | null>(null);
    const [customAiModalData, setCustomAiModalData] = useState<CustomAiPromptModalData | null>(null);
    const [contextualGroundId, setContextualGroundId] = useState<string | null>(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (session) {
            setIsLoggedIn(true);
            loadAllData();
        } else {
            setIsLoggedIn(false);
            setIsDataLoading(false);
        }
    }, [session]);
    
    const loadAllData = async () => {
        if (!user) return;
        setIsDataLoading(true);
        setAppError(null);
        try {
            await seedInitialData(); 
            const [
                plantsData, fertilizersData, compostingMethodsData,
                growingGroundsData, recentViewsData, seasonalTipsData
            ] = await Promise.all([
                getPlants(), getFertilizers(), getCompostingMethods(),
                getGrowingGrounds(), getRecentViews(), getSeasonalTips()
            ]);
            
            setPlants(plantsData);
            setPlantListItems(plantsData.map(mapPlantToPlantListItemData));
            setFertilizers(fertilizersData);
            setCompostingMethods(compostingMethodsData);
            setGrowingGrounds(growingGroundsData);
            setRecentViews(recentViewsData);
            setSeasonalTips(seasonalTipsData);
            setSeasonalTipListItems(seasonalTipsData.map(mapSeasonalTipToListItemData));

        } catch (error) {
            console.error("Failed to load data:", error);
            setAppError(error instanceof Error ? error.message : "An unknown error occurred while loading data.");
        } finally {
            setIsDataLoading(false);
        }
    };
    
    const handleAddItem = async <T, U>(
        item: T,
        addFn: (data: T) => Promise<U>,
    ) => {
        setAppError(null);
        try {
            await addFn(item);
            loadAllData();
            setModalOpen(null);
        } catch (error) {
            setAppError(error instanceof Error ? error.message : "Failed to save item.");
            console.error(error);
        }
    };

    const handleAddPlant = async (plantInput: PlantInput) => {
        const newPlantStructure = createDefaultPlantStructureInternal(plantInput);
        await handleAddItem(newPlantStructure, addPlant);
    };

    const handleUpdatePlant = async (plantId: string, updates: Partial<Plant>) => {
        setPlants(produce(draft => {
            const plantToUpdate = draft.find(p => p.id === plantId);
            if (plantToUpdate) {
                Object.assign(plantToUpdate, deepMerge(plantToUpdate, updates));
            }
        }));
        try {
            const updatedPlant = await updatePlant(plantId, updates);
            setPlants(prev => prev.map(p => p.id === plantId ? updatedPlant : p));
        } catch(e) {
            console.error("Failed to update plant, reverting UI:", e);
            setAppError(e instanceof Error ? e.message : "Failed to save changes.");
            loadAllData(); // Re-fetch to revert optimistic update
        }
    };

    const handleAddFertilizer = async (fertilizerInput: FertilizerInput) => {
        await handleAddItem(fertilizerInput, addFertilizer);
    };
    const handleAddCompostMethod = async (methodInput: CompostingMethodInput) => {
        await handleAddItem(methodInput, addCompostingMethod);
    };
    const handleAddGrowingGround = async (groundInput: GrowingGroundInput) => {
        if (!user) return;
        await handleAddItem(groundInput, (data) => addGrowingGround(data, user.id));
    };
    const handleAddSeasonalTip = async (tipInput: SeasonalTipInput) => {
        await handleAddItem(tipInput, addSeasonalTip);
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
      } catch(err) {
        setAppError(err instanceof Error ? err.message : 'AI prompt execution failed.');
      } finally {
        setIsLoadingAi(false);
      }
    };
    
    const handleUpdateWeatherPreference = async (preference: WeatherLocationPreference) => {
        if (!profile) return;
        try {
            await updateProfileData({ preferences: { ...profile.preferences, weather: preference } });
        } catch(err) {
            setAppError(err instanceof Error ? err.message : 'Failed to update weather preference.');
        }
    };

    const handleAddPlantToGround = async (data: { plantId?: string; newPlantInput?: PlantInput; quantity: number; datePlanted: string; notes?: string; status: any }) => {
        if (!contextualGroundId) return;
        const ground = growingGrounds.find(g => g.id === contextualGroundId);
        if (!ground) return;

        let plantIdToAdd = data.plantId;
        if (data.newPlantInput) {
            const newPlantStructure = createDefaultPlantStructureInternal(data.newPlantInput);
            const newPlant = await addPlant(newPlantStructure);
            plantIdToAdd = newPlant.id;
            await loadAllData();
        }

        if (!plantIdToAdd) return;

        const newPlantForGround = {
            plantId: plantIdToAdd,
            quantity: data.quantity,
            datePlanted: data.datePlanted,
            notes: data.notes,
            status: data.status
        };

        const updatedPlants = [...ground.plants, newPlantForGround];
        await updateGrowingGround(contextualGroundId, { plants: updatedPlants });
        await loadAllData();
        setModalOpen(null);
    };

    const handleAddLogEntry = async (logEntry: Omit<GroundLogEntry, 'id'>) => {
        if (!contextualGroundId) return;
        const ground = growingGrounds.find(g => g.id === contextualGroundId);
        if (!ground) return;
        
        const newLog = { ...logEntry, id: crypto.randomUUID() };
        const updatedLogs = [...ground.logs, newLog];
        await updateGrowingGround(contextualGroundId, { logs: updatedLogs });
        await loadAllData();
        setModalOpen(null);
    };

    const handleAddGroundTask = async (taskData: Omit<GroundCalendarTask, 'id' | 'status'>) => {
        if (!contextualGroundId) return;
        const ground = growingGrounds.find(g => g.id === contextualGroundId);
        if (!ground) return;
        
        const newTask = { ...taskData, id: crypto.randomUUID(), status: 'Pending' as const };
        const updatedTasks = [...ground.calendarTasks, newTask];
        await updateGrowingGround(contextualGroundId, { calendarTasks: updatedTasks });
        await loadAllData();
        setModalOpen(null);
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
            
            const newTasks: GroundCalendarTask[] = suggestedTasks.map(task => ({
                ...task,
                id: crypto.randomUUID(),
                status: 'Pending',
            }));

            const updatedTasks = [...ground.calendarTasks, ...newTasks];
            await updateGrowingGround(groundId, { calendarTasks: updatedTasks });
            await loadAllData();
        } catch (err) {
            setAppError(err instanceof Error ? err.message : "AI task generation failed.");
        } finally {
            setIsLoadingAiForGroundTasks(false);
        }
    };
    
    const handleUpdateGroundTask = async (groundId: string, taskId: string, updates: Partial<GroundCalendarTask>) => {
        const ground = growingGrounds.find(g => g.id === groundId);
        if (!ground) return;
        const updatedTasks = ground.calendarTasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
        );
        await updateGrowingGround(groundId, { calendarTasks: updatedTasks });
        await loadAllData();
    };
    const handleDeleteGroundTask = async (groundId: string, taskId: string) => {
        const ground = growingGrounds.find(g => g.id === groundId);
        if (!ground) return;
        const updatedTasks = ground.calendarTasks.filter(task => task.id !== taskId);
        await updateGrowingGround(groundId, { calendarTasks: updatedTasks });
        await loadAllData();
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
        setActiveModuleId(item.item_module_id);
        handleItemSelection(item.item_id, item.item_type);
    };

    const moduleConfig = MODULES.find(m => m.id === activeModuleId) || MODULES[0];
    const searchBarModules: Array<ActiveModuleType | 'home' | 'profile' | 'settings'> = ['florapedia', 'nutribase', 'compostcorner', 'growinggrounds', 'seasonaltips'];

    const filteredItems = useMemo(() => {
        if (!searchTerm) {
            if (activeModuleId === 'florapedia') return plantListItems;
            if (activeModuleId === 'nutribase') return fertilizers;
            if (activeModuleId === 'compostcorner') return compostingMethods;
            if (activeModuleId === 'growinggrounds') return growingGrounds;
            if (activeModuleId === 'seasonaltips') return seasonalTipListItems;
            return [];
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        switch (activeModuleId) {
            case 'florapedia':
                return plantListItems.filter(p =>
                    p.commonName.toLowerCase().includes(lowercasedFilter) ||
                    p.scientificName.toLowerCase().includes(lowercasedFilter)
                );
            case 'nutribase':
                return fertilizers.filter(f => f.fertilizer_name.toLowerCase().includes(lowercasedFilter));
            case 'compostcorner':
                return compostingMethods.filter(c => c.method_name.toLowerCase().includes(lowercasedFilter));
            case 'growinggrounds':
                return growingGrounds.filter(g => g.name.toLowerCase().includes(lowercasedFilter));
            case 'seasonaltips':
                return seasonalTipListItems.filter(t => t.title.toLowerCase().includes(lowercasedFilter));
            default:
                return [];
        }
    }, [searchTerm, activeModuleId, plantListItems, fertilizers, compostingMethods, growingGrounds, seasonalTipListItems]);
    
    const selectedItem = useMemo(() => {
        if (!selectedItemId) return null;
        switch (activeModuleId) {
            case 'florapedia': return plants.find(p => p.id === selectedItemId) || null;
            case 'nutribase': return fertilizers.find(f => f.id === selectedItemId) || null;
            case 'compostcorner': return compostingMethods.find(c => c.id === selectedItemId) || null;
            case 'growinggrounds': return growingGrounds.find(g => g.id === selectedItemId) || null;
            case 'seasonaltips': return seasonalTips.find(t => t.id === selectedItemId) || null;
            default: return null;
        }
    }, [selectedItemId, activeModuleId, plants, fertilizers, compostingMethods, growingGrounds, seasonalTips]);
    
    const calendarEvents: CalendarEvent[] = useMemo(() => {
        const events: CalendarEvent[] = [];
        growingGrounds.forEach(ground => {
            ground.calendarTasks?.forEach(task => {
                events.push({
                    id: task.id,
                    date: task.dueDate,
                    title: task.description,
                    description: task.notes || '',
                    sourceModule: 'Ground',
                    taskType: task.actionType,
                    sourceId: ground.id,
                    sourceName: ground.name,
                    isCompleted: task.status === 'Completed',
                    status: task.status,
                    color: 'bg-purple-200'
                });
            });
        });
        return events;
    }, [growingGrounds]);
    
    const renderContent = () => {
        const gridClass = `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-4`;

        switch (activeModuleId) {
            case 'home':
                return <HomePage 
                            calendarEvents={calendarEvents} 
                            recentViews={recentViews} 
                            onNavigateToRecentItem={handleNavigateToRecentItem} 
                            onNavigateToModule={(id) => { setActiveModuleId(id); setSelectedItemId(null); }}
                            seasonalTips={seasonalTipListItems}
                            weatherLocationPreference={profile?.preferences?.weather || null}
                            isDefineLocationModalOpen={modalOpen === 'defineLocation'}
                            setIsDefineLocationModalOpen={(isOpen) => setModalOpen(isOpen ? 'defineLocation' : null)}
                        />;
            case 'florapedia':
                return <ul className={gridClass}>{filteredItems.map(p => <PlantListItem key={p.id} plant={p as PlantListItemData} onSelectPlant={(id) => handleItemSelection(id, 'plant')} isSelected={selectedItemId === p.id} moduleConfig={moduleConfig} />)}</ul>;
            case 'nutribase':
                return <ul className={gridClass}>{filteredItems.map(f => <FertilizerListItem key={f.id} fertilizer={f as Fertilizer} onSelectFertilizer={(id) => handleItemSelection(id, 'fertilizer')} isSelected={selectedItemId === f.id} moduleConfig={moduleConfig} />)}</ul>;
            case 'compostcorner':
                return <ul className={gridClass}>{filteredItems.map(c => <CompostingMethodListItem key={c.id} method={c as CompostingMethod} onSelectMethod={(id) => handleItemSelection(id, 'compost_method')} isSelected={selectedItemId === c.id} moduleConfig={moduleConfig} />)}</ul>;
            case 'growinggrounds':
                return <ul className={gridClass}>{filteredItems.map(g => <GrowingGroundListItem key={g.id} ground={g as GrowingGround} onSelectGround={(id) => handleItemSelection(id, 'growing_ground')} isSelected={selectedItemId === g.id} moduleConfig={moduleConfig} />)}</ul>;
            case 'seasonaltips':
                return <ul className={gridClass}>{filteredItems.map(t => <SeasonalTipListItem key={t.id} tip={t as SeasonalTipListItemData} onSelectTip={(id) => handleItemSelection(id, 'seasonal_tip')} isSelected={selectedItemId === t.id} moduleConfig={moduleConfig} />)}</ul>;
            case 'calendar':
                return <CalendarView 
                            events={calendarEvents} 
                            moduleConfig={moduleConfig}
                            weatherLocationPreference={profile?.preferences?.weather || null}
                            setIsDefineLocationModalOpen={(isOpen) => setModalOpen(isOpen ? 'defineLocation' : null)}
                        />;
            case 'profile':
                return <ProfilePage />;
            case 'settings':
                return <SettingsPage onWeatherPreferenceSelect={handleUpdateWeatherPreference} />;
            default:
                return <div>Module Not Found</div>;
        }
    };
    
    const renderDetailView = () => {
        if (!selectedItemId) {
            return (
              <div className="hidden xl:flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <moduleConfig.icon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
                <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">{moduleConfig.name}</h2>
                <p className="text-lg">Select an item from the list to view its details.</p>
              </div>
            );
        }

        switch (activeModuleId) {
            case 'florapedia': return <PlantDetailView plant={selectedItem as Plant} onUpdatePlant={handleUpdatePlant} isLoadingAi={isLoadingAi} setIsLoadingAi={setIsLoadingAi} setAppError={setAppError} onOpenCustomAiPromptModal={(data) => { setCustomAiModalData(data); setModalOpen('customAiPrompt'); }} onPopulateWithStandardAI={handlePopulateWithStandardAI} moduleConfig={moduleConfig} onDeselect={() => setSelectedItemId(null)} isCompactView={true} />;
            case 'nutribase': return <FertilizerDetailView fertilizer={selectedItem as Fertilizer} onUpdateFertilizer={async (id, data) => { setAppError(null); try { await updateFertilizer(id, data); await loadAllData(); } catch (e) { setAppError(e instanceof Error ? e.message : "Failed to save item."); console.error(e); } }} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={() => setSelectedItemId(null)} isCompactView={true} />;
            case 'compostcorner': return <CompostingMethodDetailView method={selectedItem as CompostingMethod} onUpdateMethod={async (id, data) => { setAppError(null); try { await updateCompostingMethod(id, data); await loadAllData(); } catch (error) { setAppError(error instanceof Error ? error.message : "Failed to save item."); console.error(error); } }} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={() => setSelectedItemId(null)} isCompactView={true} />;
            case 'growinggrounds': return <GrowingGroundDetailView ground={selectedItem as GrowingGround} onUpdateGround={(id, data) => updateGrowingGround(id, data).then(() => loadAllData())} setAppError={setAppError} plants={plants} onOpenAddLogEntryModal={(id) => { setContextualGroundId(id); setModalOpen('addLogEntry'); }} onOpenAddPlantToGroundModal={(id) => { setContextualGroundId(id); setModalOpen('addPlantToGround'); }} onOpenAddGroundCalendarTaskModal={(id) => { setContextualGroundId(id); setModalOpen('addGroundTask'); }} onAiGenerateGroundTasks={handleAiGenerateGroundTasks} isLoadingAiForGroundTasks={isLoadingAiForGroundTasks} onUpdateGroundTask={handleUpdateGroundTask} onDeleteGroundTask={handleDeleteGroundTask} moduleConfig={moduleConfig} onDeselect={() => setSelectedItemId(null)} isCompactView={true} />;
            case 'seasonaltips': return <SeasonalTipDetailView tip={selectedItem as SeasonalTip} onUpdateTip={async (id, data) => { setAppError(null); try { await updateSeasonalTip(id, data); await loadAllData(); } catch (error) { setAppError(error instanceof Error ? error.message : "Failed to save item."); console.error(error); } }} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={() => setSelectedItemId(null)} isCompactView={true} />;
            default: return null;
        }
    };
    
    if (authLoading) {
        return <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><LoadingSpinner size="lg" /></div>;
    }
    
    if (!isLoggedIn) {
        return <AuthPage onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

    return (
        <div className={`flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pt-24 md:pt-32`}>
            {/* --- Modals --- */}
            {modalOpen === 'addPlant' && <AddNewPlantModal isOpen={true} onClose={() => setModalOpen(null)} onSave={handleAddPlant} moduleConfig={MODULES.find(m => m.id === 'florapedia')!} />}
            {modalOpen === 'addFertilizer' && <AddNewFertilizerModal isOpen={true} onClose={() => setModalOpen(null)} onSave={handleAddFertilizer} moduleConfig={MODULES.find(m => m.id === 'nutribase')!} />}
            {modalOpen === 'addCompost' && <AddNewCompostingMethodModal isOpen={true} onClose={() => setModalOpen(null)} onSave={handleAddCompostMethod} moduleConfig={MODULES.find(m => m.id === 'compostcorner')!} />}
            {modalOpen === 'addGround' && <AddNewGrowingGroundModal isOpen={true} onClose={() => setModalOpen(null)} onSave={handleAddGrowingGround} moduleConfig={MODULES.find(m => m.id === 'growinggrounds')!} />}
            {modalOpen === 'addTip' && <AddNewSeasonalTipModal isOpen={true} onClose={() => setModalOpen(null)} onSave={handleAddSeasonalTip} moduleConfig={MODULES.find(m => m.id === 'seasonaltips')!} />}
            {modalOpen === 'customAiPrompt' && customAiModalData && <CustomAiPromptModal isOpen={true} onClose={() => setModalOpen(null)} onExecutePrompt={handleCustomAiPrompt} plantName={customAiModalData.plantName} isLoading={isLoadingAi} moduleConfig={moduleConfig} sectionKey={customAiModalData.sectionKey} />}
            {modalOpen === 'addPlantToGround' && contextualGroundId && <AddPlantToGroundModal isOpen={true} onClose={() => setModalOpen(null)} onSave={handleAddPlantToGround} groundId={contextualGroundId} existingPlants={plants} onAddNewPlant={() => setModalOpen('addPlant')} moduleConfig={moduleConfig} />}
            {modalOpen === 'addLogEntry' && contextualGroundId && <AddLogEntryModal isOpen={true} onClose={() => setModalOpen(null)} onSave={handleAddLogEntry} groundId={contextualGroundId} moduleConfig={moduleConfig} />}
            {modalOpen === 'addGroundTask' && contextualGroundId && <AddGroundCalendarTaskModal isOpen={true} onClose={() => setModalOpen(null)} onSave={handleAddGroundTask} groundId={contextualGroundId} plantsInGround={growingGrounds.find(g => g.id === contextualGroundId)?.plants || []} allPlants={plants} moduleConfig={moduleConfig} />}
            {modalOpen === 'defineLocation' && <DefineLocationModal isOpen={true} onClose={() => setModalOpen(null)} onPreferenceSelect={handleUpdateWeatherPreference} currentPreference={profile?.preferences?.weather} />}

            {/* --- Navigation Rail --- */}
            <aside className={`relative flex flex-col items-center bg-slate-200 dark:bg-slate-800 p-2 space-y-2 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-16' : 'w-48'}`}>
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-300 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 z-10">
                    {isSidebarCollapsed ? <ArrowRightOnRectangleIcon className="w-4 h-4" /> : <ArrowLeftOnRectangleIcon className="w-4 h-4" />}
                </button>
                <div className="flex-grow w-full space-y-2 overflow-y-auto custom-scrollbar">
                    {MODULES.filter(m => m.id !== 'profile' && m.id !== 'settings').map(module => (
                        <button
                            key={module.id}
                            onClick={() => { setActiveModuleId(module.id); setSelectedItemId(null); }}
                            className={`w-full flex items-center p-2.5 rounded-lg transition-colors ${activeModuleId === module.id ? `${module.listItemSelectedBg} ${module.listItemSelectedText}` : `${module.navRailTextColor} hover:${module.listItemHoverBg}`}`}
                        >
                            <module.icon className={`w-6 h-6 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                            {!isSidebarCollapsed && <span className="font-medium text-sm">{module.name}</span>}
                        </button>
                    ))}
                </div>
                <div className="w-full">
                    <button onClick={() => { setActiveModuleId('profile'); setSelectedItemId(null); }} className={`w-full flex items-center p-2.5 rounded-lg transition-colors mb-2 ${activeModuleId === 'profile' ? `bg-teal-100 dark:bg-teal-700 text-teal-800 dark:text-teal-100` : `text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700`}`}>
                        <UserAvatar avatarUrl={profile?.avatar_url} size="sm" />
                        {!isSidebarCollapsed && <span className="font-medium text-sm ml-3">{profile?.full_name || 'Profile'}</span>}
                    </button>
                    <button onClick={() => { setActiveModuleId('settings'); setSelectedItemId(null); }} className={`w-full flex items-center p-2.5 rounded-lg transition-colors ${activeModuleId === 'settings' ? `bg-slate-300 dark:bg-slate-600` : `hover:bg-slate-300 dark:hover:bg-slate-700`}`}>
                        <CogIcon className={`w-6 h-6 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                        {!isSidebarCollapsed && 'Settings'}
                    </button>
                    <button onClick={signOut} className="w-full text-left mt-2 p-2.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 flex items-center">
                         <ArrowLeftOnRectangleIcon className={`w-6 h-6 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                         {!isSidebarCollapsed && 'Sign Out'}
                    </button>
                </div>
            </aside>
            
            {/* --- Main Content Area --- */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {searchBarModules.includes(activeModuleId) && (
                    <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <input
                            type="text"
                            placeholder={`Search in ${MODULES.find(m => m.id === activeModuleId)?.name || ''}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full border-transparent focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                         <button onClick={() => setModalOpen(`add${activeModuleId.charAt(0).toUpperCase() + activeModuleId.slice(1, -1)}` as any)} className={`ml-3 px-4 py-2 text-sm font-medium text-white ${moduleConfig.bgColor} ${moduleConfig.hoverBgColor} rounded-full shadow-sm whitespace-nowrap`}>
                            Add New
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-auto">
                     {isDataLoading ? (
                        <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>
                    ) : (
                        <div className={`h-full flex transition-all duration-300 ease-in-out`}>
                            <div className={`flex-1 transition-all duration-300 ${selectedItemId && 'hidden xl:block'}`}>
                                {renderContent()}
                            </div>
                            {selectedItemId && (
                                <div className={`w-full xl:w-1/2 2xl:w-2/5 border-l border-slate-200 dark:border-slate-700 transition-all duration-300`}>
                                    {renderDetailView()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default JardenApp;