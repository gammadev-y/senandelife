

import React, { ReactNode, useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { MODULES } from '../constants';
import { ActiveModuleType, Plant, Fertilizer, CompostingMethod, GrowingGround, SeasonalTip, RecentViewItem, WeatherLocationPreference, SeasonalTipInput, EventType, CalendarEventViewModel, CalendarEvent } from '../types';
import { MagnifyingGlassIcon, PlusIcon as PlusIconOutline, ChevronLeftIcon, ArrowRightOnRectangleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
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
import { HomeIcon, ProfileIcon, SettingsIcon, LogoutIcon, PlantsIcon, GroundsIcon, TasksIcon, TipsIcon, AddPlantIcon, EditIcon, AiFillIcon, AiImage, LogIcon, AiTasks, CancelIcon, SaveIcon, FabMenuIcon } from './icons/JardenIcons';


const NavRail: React.FC<{
  activeModuleId: ActiveModuleType | 'home' | 'profile' | 'settings';
  onModuleChange: (id: ActiveModuleType | 'home' | 'profile' | 'settings') => void;
  onSignOut: () => void;
}> = ({ activeModuleId, onModuleChange, onSignOut }) => {
  const { user } = useAuth();
  
  const allNavModules = useMemo(() => MODULES.filter(m => m.id !== 'home' && m.id !== 'profile' && m.id !== 'settings'), []);
  const publicNavModuleIds = ['florapedia', 'seasonaltips'];
  const publicNavItems = useMemo(() => allNavModules.filter(m => publicNavModuleIds.includes(m.id)), [allNavModules]);

  const topNavItems = user 
    ? [{ id: 'home', name: 'Home', icon: HomeIcon }, ...allNavModules]
    : publicNavItems;
  
  const bottomNavItems = [
    { id: 'profile', name: 'Profile', icon: ProfileIcon },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const renderNavItem = (item: { id: any; name: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = activeModuleId === item.id;
    const activeClasses = `bg-[#DCEFD6] text-[#1D3117]`;
    const inactiveClasses = 'text-[#A67C52] hover:bg-[#E5E3DD]';

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
    <nav className="hidden md:flex flex-col justify-between w-24 bg-[#F3E1D2] p-3 shadow-lg z-30">
        <ul className="space-y-2">
            {topNavItems.map(renderNavItem)}
        </ul>
        {user && (
            <ul className="space-y-2">
                {bottomNavItems.map(renderNavItem)}
                <li>
                    <button
                        onClick={onSignOut}
                        className="flex flex-col items-center justify-center w-full h-16 text-[#A67C52] hover:bg-[#F7D9D3] hover:text-[#D87C6C] rounded-2xl transition-all duration-300 ease-in-out"
                        title="Sign Out"
                    >
                        <LogoutIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium mt-1">Sign Out</span>
                    </button>
                </li>
            </ul>
        )}
    </nav>
  );
};

const Header: React.FC<{
    onGoToProfile: () => void;
    onModuleChange: (id: ActiveModuleType | 'home' | 'profile' | 'settings') => void;
    isCompactView: boolean;
}> = ({ onGoToProfile, onModuleChange, isCompactView }) => {
    const { profile, user } = useAuth();
    
    return (
        <header className="flex-shrink-0 bg-[#FDFCF9]/80 backdrop-blur-sm shadow-sm p-3 md:p-4 flex items-center justify-between z-20 border-b border-[#E5E3DD]">
            <div className="flex items-center space-x-2 md:space-x-3">
                 <Link to="/" title="Back to senande.life home">
                    <HomeIcon className="w-7 h-7 text-[#6C8C61] hover:opacity-80 transition-opacity" />
                </Link>
                <div className="flex items-baseline">
                    <Link to="/" title="Back to senande.life" className="font-semibold text-lg text-[#2C2C2C] hover:text-[#6C8C61] transition-colors no-underline">
                        senande.life
                    </Link>
                    <button onClick={() => onModuleChange('home')} className="font-semibold text-lg text-[#6C8C61] hover:opacity-80 transition-colors">
                        .jarden
                    </button>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                 <button onClick={onGoToProfile} className="block">
                    <UserAvatar avatarUrl={profile?.avatar_url} size={isCompactView ? "md" : "lg"} />
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
    eventTypes: EventType[];
    calendarEvents: CalendarEventViewModel[];
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
    onUpdateFertilizer: (fertilizerId: string, updates: Partial<Fertilizer>) => void;
    onUpdateCompostingMethod: (methodId: string, updates: Partial<CompostingMethod>) => void;
    onUpdateGrowingGround: (groundId: string, updates: Partial<GrowingGround>) => void;
    onDeleteGround: (groundId: string) => void;
    onUpdateSeasonalTip: (tipId: string, updates: Partial<SeasonalTipInput>) => void;
    onOpenAddPlantToGroundModal: (groundId: string) => void;
    onOpenAddLogEntryModal: (groundId: string) => void;
    onOpenAddEventForGround: (groundId: string) => void;
    onAiGenerateGroundTasks: (groundId: string) => Promise<void>;
    isLoadingAiForGroundTasks: boolean;
    onUpdateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
    onDeleteCalendarEvent: (eventId: string) => void;
    weatherLocationPreference: WeatherLocationPreference | null;
    setIsDefineLocationModalOpen: (isOpen: boolean) => void;
    onNavigateToRecentItem: (item: RecentViewItem) => void;
    handleAiGenerateImage: (itemId: string) => Promise<void>;
}

interface FabAction {
    id: string;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    action: () => void;
    loading?: boolean;
}

const FabSystem: React.FC<any> = (props) => {
    const { isEditing, setIsEditing, detailViewActionsRef, activeModuleId, selectedItemId, onAddNew, user } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isCompactView = window.innerWidth < 768;

    const getDetailActions = () => {
        if (!selectedItemId) return [];
        const actions: FabAction[] = [
            { id: 'edit', label: 'Edit', icon: EditIcon, action: () => setIsEditing(true) },
        ];
        if (activeModuleId === 'florapedia') {
            actions.push(
                { id: 'ai_fill', label: 'AI Fill', icon: AiFillIcon, action: () => props.onPopulateWithStandardAI(selectedItemId) },
                { id: 'ai_image', label: 'AI Image', icon: AiImage, action: () => props.handleAiGenerateImage(selectedItemId), loading: props.isLoadingAi }
            );
        }
        if (activeModuleId === 'growinggrounds') {
            actions.push(
                { id: 'add_plant', label: 'Add Plant', icon: AddPlantIcon, action: () => props.onOpenAddPlantToGroundModal(selectedItemId) },
                { id: 'add_log', label: 'Add Log', icon: LogIcon, action: () => props.onOpenAddLogEntryModal(selectedItemId) },
                { id: 'add_task', label: 'Add Task', icon: TasksIcon, action: () => props.onOpenAddEventForGround(selectedItemId) },
                { id: 'ai_tasks', label: 'AI Tasks', icon: AiTasks, action: () => props.onAiGenerateGroundTasks(selectedItemId), loading: props.isLoadingAiForGroundTasks },
                { id: 'ai_image', label: 'AI Image', icon: AiImage, action: () => props.handleAiGenerateImage(selectedItemId), loading: props.isLoadingAi }
            );
        }
        return actions;
    };

    const handleSave = () => detailViewActionsRef.current?.save();
    const handleCancel = () => detailViewActionsRef.current?.cancel();

    const ActionButton: React.FC<{ action: FabAction }> = ({ action }) => (
        <button
            onClick={() => { action.action(); setIsMenuOpen(false); }}
            disabled={action.loading}
            className="flex items-center gap-3 bg-[#fdfcf9] text-[#2C2C2C] pl-5 pr-5 py-3 rounded-full shadow-lg hover:bg-[#DCEFD6] transition-all disabled:opacity-70 border border-[#E5E3DD]"
        >
            <action.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{action.label}</span>
        </button>
    );

    const fabContainerClasses = `fixed z-50 ${isCompactView ? 'bottom-24 right-4' : 'bottom-8 right-8'}`;
    
    if (!user) return null; // No FABs for anonymous users

    if (isEditing) {
        return (
            <div className={`${fabContainerClasses} flex gap-4`}>
                <button onClick={handleCancel} className="w-16 h-16 flex items-center justify-center bg-[#F7D9D3] text-[#D87C6C] rounded-2xl shadow-lg hover:bg-[#f5c6bd] transition-all" aria-label="Cancel"><CancelIcon className="w-8 h-8" /></button>
                <button onClick={handleSave} className="w-16 h-16 flex items-center justify-center bg-[#DCEFD6] text-[#1D3117] rounded-2xl shadow-lg hover:bg-[#c9e8c4] transition-all" aria-label="Save"><SaveIcon className="w-8 h-8" /></button>
            </div>
        );
    }
    
    if (selectedItemId) {
        return (
            <div className={`${fabContainerClasses} flex flex-col-reverse items-end gap-4`}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-16 h-16 flex items-center justify-center bg-[#6C8C61] text-white rounded-2xl shadow-lg hover:bg-[#5a7850] transition-all" aria-expanded={isMenuOpen} aria-label="Open actions menu">
                    <FabMenuIcon className="w-8 h-8" />
                </button>
                {isMenuOpen && getDetailActions().map(action => <ActionButton key={action.id} action={action} />)}
            </div>
        );
    }
    
    const canAddNew = ['florapedia', 'nutribase', 'compostcorner', 'growinggrounds', 'seasonaltips', 'calendar'].includes(activeModuleId);
    if (canAddNew && !selectedItemId) { // Only show Add button in list view
        return (
            <div className={fabContainerClasses}>
                <button onClick={onAddNew} className="w-16 h-16 flex items-center justify-center bg-[#6C8C61] text-white rounded-2xl shadow-lg hover:bg-[#5a7850] transition-transform hover:scale-105" aria-label="Add new item">
                    <PlusIconOutline className="w-8 h-8" />
                </button>
            </div>
        );
    }

    return null;
};

const BottomNavBar: React.FC<any> = ({ activeModuleId, onModuleChange }) => {
    const { user } = useAuth();

    const navItemDefinitions = {
        home: { id: 'home', name: 'Home', Icon: HomeIcon },
        plants: { id: 'florapedia', name: 'Plants', Icon: PlantsIcon },
        grounds: { id: 'growinggrounds', name: 'Grounds', Icon: GroundsIcon },
        tasks: { id: 'calendar', name: 'Tasks', Icon: TasksIcon },
        tips: { id: 'seasonaltips', name: 'Tips', Icon: TipsIcon },
    };

    const authNavItems = [navItemDefinitions.home, navItemDefinitions.plants, navItemDefinitions.grounds, navItemDefinitions.tasks];
    const anonNavItems = [navItemDefinitions.plants, navItemDefinitions.tips];
    const navItems = user ? authNavItems : anonNavItems;
    
    return (
        <div className="md:hidden fixed bottom-0 inset-x-0 p-3 z-40 pointer-events-none">
            <nav className="bg-white/90 backdrop-blur-sm flex justify-around p-1.5 rounded-full shadow-2xl border border-[#E5E3DD] pointer-events-auto max-w-sm mx-auto">
                {navItems.map(item => {
                    const isActive = activeModuleId === item.id;
                    const Icon = item.Icon;
                    return (
                        <button key={item.id} onClick={() => onModuleChange(item.id as any)} className="flex flex-col items-center justify-center flex-1 h-14 rounded-full transition-all duration-200 group" aria-label={item.name} aria-current={isActive ? 'page' : undefined}>
                            <div className={`flex items-center justify-center rounded-full transition-colors duration-300 ease-in-out px-5 py-1 ${isActive ? 'bg-[#DCEFD6]' : 'bg-transparent'}`}>
                                <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-[#1D3117]' : 'text-[#A67C52] group-hover:text-[#1D3117]'}`} />
                            </div>
                            <span className={`text-xs font-medium transition-colors duration-300 mt-0.5 ${isActive ? 'text-[#1D3117]' : 'text-[#2C2C2C] group-hover:text-[#1D3117]'}`}>{item.name}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};


const JardenLayout: React.FC<JardenLayoutProps> = (props) => {
    const {
        activeModuleId, onModuleChange, searchTerm, onSearchChange, onAddNew, onSignOut,
        plants, plantListItems, fertilizers, compostingMethods, growingGrounds, seasonalTips, seasonalTipListItems,
        eventTypes, calendarEvents,
        recentViews, onItemSelect, selectedItemId, onDeselect, appError, setAppError, isLoadingAi,
        setIsLoadingAi, onUpdatePlant, onPopulateWithStandardAI,
        onUpdateFertilizer, onUpdateCompostingMethod, onUpdateGrowingGround, onDeleteGround, onUpdateSeasonalTip,
        onOpenAddPlantToGroundModal, onOpenAddLogEntryModal, onOpenAddEventForGround,
        onAiGenerateGroundTasks, isLoadingAiForGroundTasks, onUpdateCalendarEvent, onDeleteCalendarEvent,
        weatherLocationPreference, setIsDefineLocationModalOpen, onNavigateToRecentItem,
        handleAiGenerateImage
    } = props;
    
    const { user } = useAuth();
    const moduleConfig = useMemo(() => MODULES.find(m => m.id === activeModuleId) || MODULES.find(m => m.id === 'home')!, [activeModuleId]);
    const [isCompactView, setIsCompactView] = useState(window.innerWidth < 768);

    const [isEditing, setIsEditing] = useState(false);
    const detailViewActionsRef = useRef<{ save: () => void; cancel: () => void; }>(null);

    useEffect(() => {
        const handleResize = () => setIsCompactView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
        setIsEditing(false);
    }, [selectedItemId, activeModuleId]);


    const filteredItems = useMemo(() => {
        if (!searchTerm) {
            if (activeModuleId === 'florapedia') return plantListItems;
            if (activeModuleId === 'nutribase') return fertilizers;
            if (activeModuleId === 'compostcorner') return compostingMethods;
            if (activeModuleId === 'growinggrounds') return user ? growingGrounds : [];
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
                return user ? growingGrounds.filter(g => g.name.toLowerCase().includes(lowercasedFilter)) : [];
            case 'seasonaltips':
                return seasonalTipListItems.filter(t => t.title.toLowerCase().includes(lowercasedFilter) || t.description?.toLowerCase().includes(lowercasedFilter));
            default:
                return [];
        }
    }, [searchTerm, activeModuleId, plantListItems, fertilizers, compostingMethods, growingGrounds, seasonalTipListItems, user]);

    const renderListView = () => {
        const gridClasses = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4";
        return (
            <div className="p-3 md:p-4">
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-[#A67C52]" aria-hidden="true" />
                    </div>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={`Search ${moduleConfig.name}...`}
                        className="block w-full bg-white border border-[#B6B6B6] rounded-full pl-10 pr-3 py-2.5 text-sm text-[#2C2C2C] placeholder-[#A67C52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C8C61]"
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
                            default: return <div className="p-4 text-center text-[#A67C52]">Select a module from the side to see items.</div>;
                        }
                    })()
                }
            </div>
        )
    };
    
    const renderDetailView = () => {
        if (!selectedItemId) {
             const EmptyIcon = moduleConfig.icon || QuestionMarkCircleIcon;
             return (
                 <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 bg-white">
                    <EmptyIcon className={`w-24 h-24 text-[#DCEFD6] mb-6`} />
                    <h2 className="text-3xl font-semibold text-[#1D3117] mb-2">{moduleConfig.name}</h2>
                    <p className="text-lg text-[#A67C52]">Select an item from the list to view its details.</p>
                </div>
             );
        }
        switch(activeModuleId) {
            case 'florapedia': return <PlantDetailView plant={plants.find(p => p.id === selectedItemId) || null} onUpdatePlant={onUpdatePlant} isLoadingAi={isLoadingAi} setIsLoadingAi={setIsLoadingAi} setAppError={setAppError} onPopulateWithStandardAI={onPopulateWithStandardAI} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} ref={detailViewActionsRef} isEditing={isEditing} setIsEditing={setIsEditing} />;
            case 'nutribase': return <FertilizerDetailView fertilizer={fertilizers.find(f => f.id === selectedItemId) || null} onUpdateFertilizer={onUpdateFertilizer} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} />;
            case 'compostcorner': return <CompostingMethodDetailView method={compostingMethods.find(c => c.id === selectedItemId) || null} onUpdateMethod={onUpdateCompostingMethod} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} />;
            case 'growinggrounds': return <GrowingGroundDetailView ground={growingGrounds.find(g => g.id === selectedItemId) || null} onUpdateGround={onUpdateGrowingGround} onDeleteGround={onDeleteGround} setAppError={setAppError} plants={plants} onOpenAddLogEntryModal={onOpenAddLogEntryModal} onOpenAddPlantToGroundModal={onOpenAddPlantToGroundModal} onOpenAddEventForGround={onOpenAddEventForGround} onAiGenerateGroundTasks={onAiGenerateGroundTasks} isLoadingAiForGroundTasks={isLoadingAiForGroundTasks} onUpdateCalendarEvent={onUpdateCalendarEvent} onDeleteCalendarEvent={onDeleteCalendarEvent} calendarEvents={calendarEvents} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} ref={detailViewActionsRef} isEditing={isEditing} setIsEditing={setIsEditing} />;
            case 'seasonaltips': return <SeasonalTipDetailView tip={seasonalTips.find(t => t.id === selectedItemId) || null} onUpdateTip={onUpdateSeasonalTip} setAppError={setAppError} moduleConfig={moduleConfig} onDeselect={onDeselect} isCompactView={isCompactView} />;
            default: return null;
        }
    };

    const renderMainContent = () => {
        switch (activeModuleId) {
            case 'home': return <HomePage calendarEvents={calendarEvents} recentViews={recentViews} onNavigateToRecentItem={onNavigateToRecentItem} onNavigateToModule={onModuleChange} seasonalTips={seasonalTipListItems} weatherLocationPreference={weatherLocationPreference} isDefineLocationModalOpen={false} setIsDefineLocationModalOpen={setIsDefineLocationModalOpen} />;
            case 'calendar': return <CalendarView calendarEvents={calendarEvents} moduleConfig={moduleConfig} weatherLocationPreference={weatherLocationPreference} setIsDefineLocationModalOpen={setIsDefineLocationModalOpen} onUpdateCalendarEvent={onUpdateCalendarEvent} />;
            case 'profile': return <ProfilePage />;
            case 'settings': return <SettingsPage onWeatherPreferenceSelect={() => {}} />;
            default:
                return (
                    <div className="flex flex-1 overflow-hidden">
                        <aside className={`w-full lg:w-1/3 xl:w-1/4 bg-[#fdfcf9] border-r border-[#E5E3DD] flex-col overflow-y-auto custom-scrollbar ${selectedItemId && isCompactView ? 'hidden' : 'flex'}`}>
                            {renderListView()}
                        </aside>
                        <section className={`flex-1 bg-white overflow-y-auto custom-scrollbar ${!selectedItemId && isCompactView ? 'hidden' : 'block'}`}>
                            {renderDetailView()}
                        </section>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen w-screen flex text-[#2C2C2C] font-sans">
            <NavRail activeModuleId={activeModuleId} onModuleChange={onModuleChange} onSignOut={onSignOut} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header onGoToProfile={() => onModuleChange('profile')} onModuleChange={onModuleChange} isCompactView={isCompactView} />
                <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
                    {renderMainContent()}
                </main>
            </div>
             <FabSystem
                user={user}
                activeModuleId={activeModuleId}
                selectedItemId={selectedItemId}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                detailViewActionsRef={detailViewActionsRef}
                onAddNew={onAddNew}
                onPopulateWithStandardAI={onPopulateWithStandardAI}
                handleAiGenerateImage={handleAiGenerateImage}
                onOpenAddPlantToGroundModal={onOpenAddPlantToGroundModal}
                onOpenAddLogEntryModal={onOpenAddLogEntryModal}
                onOpenAddEventForGround={onOpenAddEventForGround}
                onAiGenerateGroundTasks={onAiGenerateGroundTasks}
                isLoadingAiForGroundTasks={isLoadingAiForGroundTasks}
                isLoadingAi={isLoadingAi}
             />
             <BottomNavBar activeModuleId={activeModuleId} onModuleChange={onModuleChange} />
        </div>
    );
};


export default JardenLayout;