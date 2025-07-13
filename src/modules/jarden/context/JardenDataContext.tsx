



import React, { createContext, useState, useEffect, useCallback, useMemo, useContext, ReactNode } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
    Plant, Fertilizer, CompostingMethod, GrowingGround, ActiveModuleType,
    RecentViewItem, SeasonalTip, UserProfile, EventType, CalendarEvent, CalendarEventViewModel
} from '../types';
import {
    getPlants, getFertilizers, getCompostingMethods,
    getGrowingGrounds, getRecentViews, getSeasonalTips,
    seedInitialData, mapPlantToPlantListItemData, mapSeasonalTipToListItemData,
    getEventTypes, seedEventTypes, getCalendarEvents
} from '../services/supabaseService';
import { PlantListItemData, SeasonalTipListItemData } from '../services/idbServiceTypes';

interface JardenDataContextType {
    plants: Plant[];
    fertilizers: Fertilizer[];
    compostingMethods: CompostingMethod[];
    growingGrounds: GrowingGround[];
    seasonalTips: SeasonalTip[];
    recentViews: RecentViewItem[];
    eventTypes: EventType[];
    calendarEvents: CalendarEventViewModel[];
    plantListItems: PlantListItemData[];
    seasonalTipListItems: SeasonalTipListItemData[];
    isDataLoading: boolean;
    appError: string | null;
    setAppError: (error: string | null) => void;
    refreshAllData: () => Promise<void>;
}

const JardenDataContext = createContext<JardenDataContextType | undefined>(undefined);

export const JardenDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [appError, setAppError] = useState<string | null>(null);

    const [plants, setPlants] = useState<Plant[]>([]);
    const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
    const [compostingMethods, setCompostingMethods] = useState<CompostingMethod[]>([]);
    const [growingGrounds, setGrowingGrounds] = useState<GrowingGround[]>([]);
    const [seasonalTips, setSeasonalTips] = useState<SeasonalTip[]>([]);
    const [recentViews, setRecentViews] = useState<RecentViewItem[]>([]);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEventViewModel[]>([]);

    const plantListItems = useMemo(() => plants.map(mapPlantToPlantListItemData), [plants]);
    const seasonalTipListItems = useMemo(() => seasonalTips.map(mapSeasonalTipToListItemData), [seasonalTips]);
    
    const refreshAllData = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) {
            setIsDataLoading(true);
        }
        setAppError(null);
        try {
            if (isInitialLoad) {
                await seedInitialData();
                await seedEventTypes();
            }
            const [
                plantsData, fertilizersData, compostingMethodsData,
                growingGroundsData, recentViewsData, seasonalTipsData,
                eventTypesData, calendarEventsData
            ] = await Promise.all([
                getPlants(), getFertilizers(), getCompostingMethods(),
                getGrowingGrounds(user?.id), getRecentViews(user?.id), getSeasonalTips(),
                getEventTypes(), getCalendarEvents(user?.id)
            ]);

            setPlants(plantsData);
            setFertilizers(fertilizersData);
            setCompostingMethods(compostingMethodsData);
            setGrowingGrounds(growingGroundsData);
            setRecentViews(recentViewsData);
            setSeasonalTips(seasonalTipsData);
            setEventTypes(eventTypesData);
            setCalendarEvents(calendarEventsData);

        } catch (error) {
            console.error("Failed to load data:", error);
            setAppError(error instanceof Error ? error.message : "An unknown error occurred while loading data.");
        } finally {
            if (isInitialLoad) {
                setIsDataLoading(false);
            }
        }
    }, [user?.id]);

    useEffect(() => {
        refreshAllData(true);
    }, [user?.id, refreshAllData]);

    const value: JardenDataContextType = {
        plants,
        fertilizers,
        compostingMethods,
        growingGrounds,
        seasonalTips,
        recentViews,
        eventTypes,
        calendarEvents,
        plantListItems,
        seasonalTipListItems,
        isDataLoading,
        appError,
        setAppError,
        refreshAllData,
    };

    return (
        <JardenDataContext.Provider value={value}>
            {children}
        </JardenDataContext.Provider>
    );
};

export const useJardenData = (): JardenDataContextType => {
    const context = useContext(JardenDataContext);
    if (context === undefined) {
        throw new Error('useJardenData must be used within a JardenDataProvider');
    }
    return context;
};