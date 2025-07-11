
import React, { ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { MODULES } from '../constants';
import { ActiveModuleType, Plant, Fertilizer, CompostingMethod, GrowingGround, SeasonalTip, CalendarEvent, RecentViewItem, WeatherLocationPreference, GroundCalendarTask, SeasonalTipInput } from '../types';
import { MagnifyingGlassIcon, PlusIcon, ArrowLeftOnRectangleIcon, ChevronLeftIcon, HomeIcon, UserCircleIcon, CogIcon, CalendarDaysIcon, BellIcon, ArrowRightOnRectangleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import UserAvatar from './UserAvatar';

import HomePage from './HomePage';
import PlantListItem from './PlantListItem';
import PlantDetailView from './PlantDetailView';
import FertilizerListItem from './FertilizerListItem';
import FertilizerDetailView from './FertilizerDetailView';
import CompostingMethodListItem from './CompostingMethodListItem';
import CompostingMethodDetailView from './CompostingMethodDetailView';
import GrowingGroundListItem from './GrowingGroundListItem';
import GrowingGroundDetailView from './GrowingGroundDetailView';
import SeasonalTipListItem from './SeasonalTipListItem';
import SeasonalTipDetailView from './SeasonalTipDetailView';
import CalendarView from './CalendarView';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { PlantListItemData, SeasonalTipListItemData } from '../services/idbServiceTypes';
import LeafIcon from './icons/LeafIcon';


const NavRail: React.FC<{
  activeModuleId: ActiveModuleType | 'home' | 'profile' | 'settings';
  onModuleChange: (id: ActiveModuleType | 'home' | 'profile' | 'settings') => void;
  onSignOut: () => void;
}> = ({ activeModuleId, onModuleChange, onSignOut }) => {
  const { profile } = useAuth();
  
  const navModules = useMemo(() => MODULES.filter(m => m.id !== 'home' && m.id !== 'profile'), []);

  const topNavItems = [
    { id: 'home', name: 'Home', icon: HomeIcon },
    ...navModules,
  ];
  
  const bottomNavItems = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  const renderNavItem = (item: { id: any; name: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = activeModuleId === item.id;
    const moduleConfig = MODULES.find(m => m.id === item.id);
    const activeClasses = `bg-${moduleConfig?.baseColorClass}-100 dark:bg-${moduleConfig?.baseColorClass}-800/50 text-${moduleConfig?.baseColorClass}-600 dark:text-${moduleConfig?.baseColorClass}-300`;
    const inactiveClasses = 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200';

    return (
      <li key={item.id}>
        <button
          onClick={() => onModuleChange(item.id)}
          className={`flex flex-col items-center justify-center w-full h-16 rounded-2xl transition-all duration-300 ease-in-out ${isActive ? activeClasses : inactiveClasses}`}
          aria-label={item.name}
          title={item.name}
        >
          <Icon className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">{item.name}</span>
        </button>
      </li>
    );
  };
  
  return (
    <nav className="hidden md:flex flex-col justify-between w-24 bg-white dark:bg-slate-800 p-3 shadow-lg z-30">
        <ul className="space-y-2">
            {topNavItems.map(renderNavItem)}
        </ul>
        <ul className="space-y-2">
            {bottomNavItems.map(renderNavItem)}
            <li>
                <button
                    onClick={onSignOut}
                    className="flex flex-col items-center justify-center w-full h-16 text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-800/50 hover:text-red-600 dark:hover:text-red-400 rounded-2xl transition-all duration-300 ease-in-out"
                    title="Sign Out"
                >
                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-1">Sign Out</span>
                </button>
            </li>
        </ul>
    </nav>
  );
};

const BottomNavBar: React.FC<{
    activeModuleId: ActiveModuleType | 'home' | 'profile' | 'settings';
    onModuleChange: (id: ActiveModuleType | 'home' | 'profile' | 'settings') => void;
}> = ({ activeModuleId, onModuleChange }) => {
    const navItems = [
        { id: 'home', name: 'Home', icon: HomeIcon },
        { id: 'florapedia', name: 'Explore', icon: MagnifyingGlassIcon },
        { id: 'growinggrounds', name: 'My Jarden', icon: LeafIcon },
        { id: 'calendar', name: 'Tasks', icon: CalendarDaysIcon },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 flex justify-around p-1 z-40">
            {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeModuleId === item.id;
                const moduleConfig = MODULES.find(m => m.id === item.id);
                const colorClass = moduleConfig ? `text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-400` : 'text-emerald-600 dark:text-emerald-400';
                const inactiveColorClass = 'text-slate-500 dark:text-slate-400';

                return (
                    <button
                        key={item.id}
                        onClick={() => onModuleChange(item.id as any)}
                        className="flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-200 ease-in-out"
                        aria-label={item.name}
                    >
                        <Icon className={`w-6 h-6 transition-colors ${isActive ? colorClass : inactiveColorClass}`} />
                        <span className={`text-xs mt-0.5 transition-colors ${isActive ? colorClass : inactiveColorClass}`}>
                            {item.name}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};


const Header: React.FC<{
    onAddNew: () => void;
    activeModuleId: ActiveModuleType | 'home' | 'profile' | 'settings';
    onGoToProfile: () => void;
}> = ({ onAddNew, activeModuleId, onGoToProfile }) => {
    const { profile } = useAuth();
    const canAddNew = ['florapedia', 'nutribase', 'compostcorner', 'growinggrounds', 'seasonaltips'].includes(activeModuleId);
    const moduleConfig = MODULES.find(m => m.id === activeModuleId) || MODULES.find(m => m.id === 'home')!;

    return (
        <header className="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm p-3 md:p-4 flex items-center justify-between z-20">
            <div className="flex items-center space-x-3">
                <Link to="/" title="Back to senande.life" className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity">
                    <LeafIcon className="w-7 h-7" />
                </Link>
                <span className="font-semibold text-lg text-slate-700 dark:text-slate-200 hidden sm:block">
                    senande.life
                </span>
            </div>
            <div className="flex items-center space-x-3">
                {canAddNew && (
                    <button
                        onClick={onAddNew}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-full shadow-sm text-white ${moduleConfig.bgColor} ${moduleConfig.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-emerald-500 transition-all duration-300 ease-in-out`}
                    >
                        <PlusIcon className="w-5 h-5 mr-1 -ml-1" />
                        Add New
                    </button>
                )}
                <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-colors duration-200 ease-in-out">
                    <BellIcon className="w-6 h-6" />
                </button>
                 <button onClick={onGoToProfile} className="block md:hidden">
                    <UserAvatar avatarUrl={profile?.avatar_url} size="md" />
                </button>
                 <button onClick={onGoToProfile} className="hidden md:block">
                     <UserAvatar avatarUrl={profile?.avatar_url} size="lg" />
                 </button>
            </div>
        </header>
    );
};


interface JardenLayoutProps {
    activeModuleId: ActiveModuleType | 'home' | 'profile' | 'settings';
    onModuleChange: (id: ActiveModuleType | 'home' | 'profile' | 'settings') => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onAddNew: () => void;
    onSignOut: () => void;
    plants: Plant[];
    plantListItems: PlantListItemData[];
    fertilizers: Fertilizer[];
    compostingMethods: CompostingMethod[];
    growingGrounds: GrowingGround[];
    seasonalTips: SeasonalTip[];
    seasonalTipListItems: SeasonalTipListItemData[];
    recentViews: RecentViewItem[];
    onItemSelect: (id: string, itemType: string) => void;
    selectedItemId: string | null;
    onDeselect: () => void;
    appError: string | null;
    setAppError: (error: string | null) => void;
    isLoadingAi: boolean;
    setIsLoadingAi: (loading: boolean) => void;
    onUpdatePlant: (plantId: string, updates: Partial<Plant>) => void;
    onPopulateWithStandardAI: (plantId: string) => void;
    onOpenCustomAiPromptModal: (data: any) => void;
    onUpdateFertilizer: (fertilizerId: string, updates: Partial<Fertilizer>) => void;
    onUpdateCompostingMethod: (methodId: string, updates: Partial<CompostingMethod>) => void;
    onUpdateGrowingGround: (groundId: string, updates: Partial<GrowingGround>) => void;
    onDeleteGround: (groundId: string) => void;
    onUpdateSeasonalTip: (tipId: string, updates: Partial<SeasonalTipInput>) => void;
    onOpenAddPlantToGroundModal: (groundId: string) => void;
    onOpenAddLogEntryModal: (groundId: string) => void;
    onOpenAddGroundCalendarTaskModal: (groundId: string) => void;
    onAiGenerateGroundTasks: (groundId: string) => Promise<void>;
    isLoadingAiForGroundTasks: boolean;
    onUpdateGroundTask: (groundId: string, taskId: string, updates: Partial<GroundCalendarTask>) => void;
    onDeleteGroundTask: (groundId: string, taskId: string) => void;
    weatherLocationPreference: WeatherLocationPreference | null;
    setIsDefineLocationModalOpen: (isOpen: boolean) => void;
    onNavigateToRecentItem: (item: RecentViewItem) => void;
}

const JardenLayout: React.FC<JardenLayoutProps> = (props) => {
    const {
        activeModuleId, onModuleChange, searchTerm, onSearchChange, onAddNew, onSignOut,
        plants, plantListItems, fertilizers, compostingMethods, growingGrounds, seasonalTips, seasonalTipListItems,
        recentViews, onItemSelect, selectedItemId, onDeselect, appError, setAppError, isLoadingAi,
        setIsLoadingAi, onUpdatePlant, onPopulateWithStandardAI, onOpenCustomAiPromptModal,
        onUpdateFertilizer, onUpdateCompostingMethod, onUpdateGrowingGround, onDeleteGround, onUpdateSeasonalTip,
        onOpenAddPlantToGroundModal, onOpenAddLogEntryModal, onOpenAddGroundCalendarTaskModal,
        onAiGenerateGroundTasks, isLoadingAiForGroundTasks, onUpdateGroundTask, onDeleteGroundTask,
        weatherLocationPreference, setIsDefineLocationModalOpen, onNavigateToRecentItem
    } = props;
    
    const moduleConfig = useMemo(() => MODULES.find(m => m.id === activeModuleId) || MODULES.find(m => m.id === 'home')!, [activeModuleId]);
    const isCompactView = window.innerWidth < 1024;

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
                return plantListItems.filter(p => p.commonName.toLowerCase().includes(lowercasedFilter) || p.scientificName.toLowerCase().includes(lowercasedFilter));
            case 'nutribase':
                return fertilizers.filter(f => f.fertilizer_name.toLowerCase().includes(lowercasedFilter));
            case 'compostcorner':
                return compostingMethods.filter(c => c.method_name.toLowerCase().includes(lowercasedFilter));
            case 'growinggrounds':
                return growingGrounds.filter(g => g.name.toLowerCase().includes(lowercasedFilter));
            case 'seasonaltips':
                return seasonalTipListItems.filter(t => t.title.toLowerCase().includes(lowercasedFilter) || t.description?.toLowerCase().includes(lowercasedFilter));
            default:
                return [];
        }
    }, [searchTerm, activeModuleId, plantListItems, fertilizers, compostingMethods, growingGrounds, seasonalTipListItems]);

    const renderListView = () => {
        const gridClasses = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4";
        return (
            <div className="p-3 md:p-4">
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={`Search ${moduleConfig.name}...`}
                        className="block w-full bg-slate-100 dark:bg-slate-700 border-transparent rounded-full pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-emerald-500"
                    />
                </div>
                
                {
                    (() => {
                        switch(activeModuleId) {
                            case 'florapedia': return <ul className={gridClasses}>{filteredItems.map(p => <PlantListItem key={p.id} plant={p as PlantListItemData} onSelectPlant={(id) => onItemSelect(id, 'plant')} isSelected={selectedItemId === p.id} moduleConfig={moduleConfig} />)}</ul>;
                            case 'nutribase': return <ul className={gridClasses}>{filteredItems.map(f => <FertilizerListItem key={f.id} fertilizer={f as Fertilizer} onSelectFertilizer={(id) => onItemSelect(id, 'fertilizer')} isSelected={selectedItemId === f.id} moduleConfig={moduleConfig} />)}</ul>;
                            case 'compostcorner': return <ul className={gridClasses}>{filteredItems.map(c => <CompostingMethodListItem key={c.id} method={c as CompostingMethod} onSelectMethod={(id) => onItemSelect(id, 'compost_method')} isSelected={selectedItemId === c.id} moduleConfig={moduleConfig} />)}</ul>;
                            case 'growinggrounds': return <ul className={gridClasses}>{filteredItems.map(g => <GrowingGroundListItem key={g.id} ground={g as GrowingGround} onSelectGround={(id) => onItemSelect(id, 'growing_ground')} isSelected={selectedItemId === g.id} moduleConfig={moduleConfig} />)}</ul>;
                            case 'seasonaltips': return <ul className={gridClasses}>{filteredItems.map(t => <SeasonalTipListItem key={t.id} tip={t as SeasonalTipListItemData} onSelectTip={(id) => onItemSelect(id, 'seasonal_tip')} isSelected={selectedItemId === t.id} moduleConfig={moduleConfig} />)}</ul>;
                            default: return <div className="p-4 text-center text-slate-500">Select a module from the side to see items.</div>;
                        }
                    })()
                }
            </div>
        )
    };
    
    const calendarEvents = useMemo(() => {
        // This logic needs to be implemented based on plant and ground data
        return [] as CalendarEvent[];
    }, [plants, growingGrounds]);


    const renderDetailView = () => {
        if (!selectedItemId) {
             const EmptyIcon = moduleConfig.icon || QuestionMarkCircleIcon;
             return (
                 <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">
                    <EmptyIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
                    <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">{moduleConfig.name}</h2>
                    <p className="text-lg">Select an item from the list to view its details.</p>
                </div>
             );
        }
        switch(activeModuleId) {
            case 'florapedia': return <PlantDetailView plant={plants.find(p => p.id === selectedItemId) || null} onUpdatePlant={onUpdatePlant} isLoadingAi={isLoadingAi} setIsLoadingAi={setIsLoadingAi} setAppError={setAppError} onOpenCustomAiPromptModal={onOpenCustomAiPromptModal} onPopulateWithStandardAI={onPopulateWithStandardAI} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} />;
            case 'nutribase': return <FertilizerDetailView fertilizer={fertilizers.find(f => f.id === selectedItemId) || null} onUpdateFertilizer={onUpdateFertilizer} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} />;
            case 'compostcorner': return <CompostingMethodDetailView method={compostingMethods.find(c => c.id === selectedItemId) || null} onUpdateMethod={onUpdateCompostingMethod} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} />;
            case 'growinggrounds': return <GrowingGroundDetailView ground={growingGrounds.find(g => g.id === selectedItemId) || null} onUpdateGround={onUpdateGrowingGround} onDeleteGround={onDeleteGround} setAppError={setAppError} plants={plants} onOpenAddLogEntryModal={onOpenAddLogEntryModal} onOpenAddPlantToGroundModal={onOpenAddPlantToGroundModal} onOpenAddGroundCalendarTaskModal={onOpenAddGroundCalendarTaskModal} onAiGenerateGroundTasks={onAiGenerateGroundTasks} isLoadingAiForGroundTasks={isLoadingAiForGroundTasks} onUpdateGroundTask={onUpdateGroundTask} onDeleteGroundTask={onDeleteGroundTask} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} />;
            case 'seasonaltips': return <SeasonalTipDetailView tip={seasonalTips.find(t => t.id === selectedItemId) || null} onUpdateTip={onUpdateSeasonalTip} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} />;
            default: return null;
        }
    };

    const renderMainContent = () => {
        switch (activeModuleId) {
            case 'home': return <HomePage calendarEvents={calendarEvents} recentViews={recentViews} onNavigateToRecentItem={onNavigateToRecentItem} onNavigateToModule={onModuleChange} seasonalTips={seasonalTipListItems} weatherLocationPreference={weatherLocationPreference} isDefineLocationModalOpen={false} setIsDefineLocationModalOpen={setIsDefineLocationModalOpen} />;
            case 'calendar': return <CalendarView events={calendarEvents} moduleConfig={moduleConfig} weatherLocationPreference={weatherLocationPreference} setIsDefineLocationModalOpen={setIsDefineLocationModalOpen} />;
            case 'profile': return <ProfilePage />;
            case 'settings': return <SettingsPage onWeatherPreferenceSelect={() => {}} />;
            default:
                return (
                    <div className="flex flex-1 overflow-hidden">
                        <aside className={`w-full lg:w-1/3 xl:w-1/4 border-r border-slate-200 dark:border-slate-700 flex-col overflow-y-auto custom-scrollbar ${selectedItemId && isCompactView ? 'hidden' : 'flex'}`}>
                            {renderListView()}
                        </aside>
                        <section className={`flex-1 bg-white dark:bg-slate-800 overflow-y-auto custom-scrollbar ${!selectedItemId && isCompactView ? 'hidden' : 'block'}`}>
                            {renderDetailView()}
                        </section>
                    </div>
                );
        }
    };


    return (
        <div className="h-screen w-screen bg-slate-100 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100 font-sans">
            <NavRail activeModuleId={activeModuleId} onModuleChange={onModuleChange} onSignOut={onSignOut} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header onAddNew={onAddNew} activeModuleId={activeModuleId} onGoToProfile={() => onModuleChange('profile')} />
                <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    {renderMainContent()}
                </main>
            </div>
            <BottomNavBar activeModuleId={activeModuleId} onModuleChange={onModuleChange} />
        </div>
    );
};

export default JardenLayout;
