






import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    UserCircleIcon, 
    ChevronRightIcon
} from '@heroicons/react/24/solid'; 
import { 
    ClockIcon as OutlineClockIcon, 
    LightBulbIcon as OutlineLightBulbIcon,
    ArrowLeftOnRectangleIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { CalendarEventViewModel, RecentViewItem, ActiveModuleType, WeatherLocationPreference, SeasonalTip } from '../types';
import { MODULES } from '../constants';
import PlantStockIcon from './icons/PlantStockIcon';
import GroundStockIcon from './icons/GroundStockIcon';
import { BeakerIcon, CubeTransparentIcon, CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/outline';
import WeatherBanner from './WeatherBanner'; 
import { SeasonalTipListItemData } from '../services/idbServiceTypes';


interface HomePageCardProps {
  title: string;
  description?: string; 
  imageUrl?: string | null;
  imagePositionY?: number;
  icon?: React.ElementType;
  onClick?: () => void;
  itemType?: RecentViewItem['item_type']; 
  baseColorClass?: string;
  isLink?: boolean;
  to?: string;
}

const HomePageCard: React.FC<HomePageCardProps> = ({ title, description, imageUrl, imagePositionY = 50, icon: Icon, onClick, itemType, baseColorClass = 'green', isLink = false, to = '#' }) => {
  
  const renderStockIcon = () => {
    const stockIconProps = { className: `w-full h-full object-contain p-4 text-[#A67C52]` };
    switch (itemType) {
        case 'plant': return <PlantStockIcon {...stockIconProps} />;
        case 'fertilizer': return <BeakerIcon {...stockIconProps} />;
        case 'compost_method': return <CubeTransparentIcon {...stockIconProps} />;
        case 'growing_ground': return <GroundStockIcon {...stockIconProps} />;
        case 'seasonal_tip': return <OutlineLightBulbIcon {...stockIconProps} />;
        default: return Icon ? <Icon className={`w-10 h-10 text-[#A67C52]`} /> : <SolidCheckCircleIcon className={`w-10 h-10 text-[#A67C52]`} />;
    }
  };

  const CardContent = () => (
     <div 
      className={`bg-white border border-[#E5E3DD] rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${!isLink && 'cursor-pointer active:scale-[0.98]'}`}
      onClick={!isLink ? onClick : undefined}
      role={!isLink ? "button" : undefined}
      tabIndex={!isLink ? 0 : -1}
      onKeyDown={(e) => !isLink && (e.key === 'Enter' || e.key === ' ') && onClick && onClick()}
      aria-label={`View ${title}`}
    >
      <div className="w-full h-32 bg-[#E5E3DD] flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" style={{ objectPosition: `50% ${imagePositionY}%`}}/>
        ) : (
          renderStockIcon()
        )}
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-center mb-1">
          {Icon && !imageUrl && <Icon className={`w-5 h-5 mr-2 text-[#6C8C61]`} />}
          <h3 className="text-sm md:text-md font-semibold text-[#2C2C2C] truncate" title={title}>{title}</h3>
        </div>
        {description && <p className="text-xs md:text-sm text-[#A67C52] leading-relaxed line-clamp-2">{description}</p>}
      </div>
    </div>
  );

  if (isLink) {
    return <Link to={to} className="no-underline active:scale-[0.98] block transition-transform"><CardContent /></Link>
  }

  return <CardContent />;
};

interface HomePageProps {
  calendarEvents: CalendarEventViewModel[];
  recentViews: RecentViewItem[];
  onNavigateToRecentItem: (item: RecentViewItem) => void;
  onNavigateToModule: (moduleId: ActiveModuleType | 'home' | 'profile' | 'settings') => void;
  seasonalTips: SeasonalTipListItemData[];
  weatherLocationPreference: WeatherLocationPreference | null;
  isDefineLocationModalOpen: boolean; 
  setIsDefineLocationModalOpen: (isOpen: boolean) => void;
}


const HomePage: React.FC<HomePageProps> = ({ 
    calendarEvents, recentViews, onNavigateToRecentItem, onNavigateToModule, seasonalTips,
    weatherLocationPreference, setIsDefineLocationModalOpen 
}) => {
  const seasonalTipsModuleConfig = MODULES.find(m => m.id === 'seasonaltips') || MODULES[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysTasks = calendarEvents.filter(event => {
    const eventDate = new Date(event.start_date);
    eventDate.setHours(0,0,0,0);
    return eventDate.getTime() === today.getTime() && event.status !== 'Completed';
  }).sort((a,b) => a.title.localeCompare(b.title));

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 6);

  const restOfWeekTasks = calendarEvents.filter(event => {
    const eventDate = new Date(event.start_date);
    eventDate.setHours(0,0,0,0);
    return eventDate >= tomorrow && eventDate <= endOfWeek && event.status !== 'Completed';
  }).sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime() || a.title.localeCompare(b.title));

  
  const latestSeasonalTips = seasonalTips.slice(0, 3);

  const displayRecentViews = useMemo(() => {
    if (!recentViews || recentViews.length === 0) return [];
    
    const filteredViews = recentViews.filter(view => 
        view.item_type === 'plant' || view.item_type === 'growing_ground'
    );
    
    const uniqueItemIds = new Set<string>();
    const uniqueViews: RecentViewItem[] = [];
    for (const view of filteredViews) { 
        if (!uniqueItemIds.has(view.item_id)) {
            uniqueItemIds.add(view.item_id);
            uniqueViews.push(view);
        }
        if (uniqueViews.length >= 4) break;
    }
    return uniqueViews;
  }, [recentViews]);

  return (
    <div className="p-4 md:p-6 space-y-6"> {/* Overall padding and spacing */}
      
      <div className="print:hidden"> {/* WeatherBanner container */}
         <WeatherBanner 
            weatherLocationPreference={weatherLocationPreference} 
            setIsDefineLocationModalOpen={setIsDefineLocationModalOpen} 
        />
      </div>

      {/* Section 1: Today's Tasks */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-[#1D3117] px-1">Today's Tasks ({today.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})})</h2>
        <div className="bg-white border border-[#E5E3DD] rounded-2xl shadow-lg p-4">
          {todaysTasks.length === 0 ? (
            <div className="flex items-center text-[#6C8C61]">
              <SolidCheckCircleIcon className="w-7 h-7 mr-2.5 flex-shrink-0" />
              <p className="text-md font-medium">You're all caught up! No pressing tasks for today.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {todaysTasks.slice(0,3).map(task => { 
                const colorHex = task.event_types?.color_code || '#B6B6B6';
                return (
                  <li key={task.id} className="flex items-start p-2.5 bg-[#FDFCF9] rounded-lg" style={{ borderLeft: `4px solid ${colorHex}`}}>
                    <span className="w-6 text-xl flex items-center justify-center mr-3 flex-shrink-0">{task.event_types?.icon_name || '📝'}</span>
                    <div>
                      <p className={`text-sm font-medium text-[#2C2C2C]`}>{task.title}</p>
                      <p className="text-xs text-[#A67C52]">{task.event_types?.name}</p>
                    </div>
                  </li>
                );
              })}
              {todaysTasks.length > 3 && <p className="text-xs text-center text-[#A67C52] pt-2">...and {todaysTasks.length - 3} more. View Tasks page for all.</p>}
            </ul>
          )}
        </div>
      </section>
      
      {/* Separator and Section 2: Rest of Week */}
      {restOfWeekTasks.length > 0 && (
        <>
          <hr className="border-[#E5E3DD]"/>
          <section>
            <h2 className="text-lg font-semibold mb-3 text-[#1D3117] px-1">Rest of the Week</h2>
             <div className="bg-white border border-[#E5E3DD] rounded-2xl shadow-lg p-4">
                <ul className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {restOfWeekTasks.map(task => {
                        const colorHex = task.event_types?.color_code || '#B6B6B6';
                        return (
                            <li key={task.id} className="flex items-start p-2.5 bg-[#FDFCF9] rounded-lg" style={{ borderLeft: `4px solid ${colorHex}`}}>
                            <span className="w-6 text-xl flex items-center justify-center mr-3 flex-shrink-0">{task.event_types?.icon_name || '📝'}</span>
                            <div>
                                <div className="flex justify-between items-baseline">
                                    <p className={`text-sm font-medium text-[#2C2C2C]`}>{task.title}</p>
                                    <p className="text-xs text-[#A67C52] ml-2">{new Date(task.start_date).toLocaleDateString(undefined, { weekday: 'short' })}</p>
                                </div>
                                <p className="text-xs text-[#A67C52]">{task.event_types?.name}</p>
                            </div>
                            </li>
                        );
                    })}
                </ul>
             </div>
          </section>
        </>
      )}

      {/* Separator and Section 3: Recently Viewed */}
      <hr className="border-[#E5E3DD]"/>
      <section>
        <h2 className="text-lg font-semibold mb-3 text-[#1D3117] px-1 flex items-center">
          <OutlineClockIcon className="w-5 h-5 mr-2 text-[#A67C52]" />
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayRecentViews.slice(0, 4).map(item => (
            <HomePageCard
              key={item.item_id} 
              title={item.item_name}
              imageUrl={item.item_image_url}
              onClick={() => onNavigateToRecentItem(item)}
              itemType={item.item_type}
              baseColorClass={MODULES.find(m => m.id === item.item_module_id)?.baseColorClass || 'gray'}
            />
          ))}
        </div>
      </section>

      {/* Separator and Section 4: Seasonal Tips */}
      {latestSeasonalTips.length > 0 && (
        <>
          <hr className="border-[#E5E3DD]"/>
          <section>
            <button 
              onClick={() => onNavigateToModule('seasonaltips')}
              className="w-full group text-left text-lg font-semibold mb-3 text-[#1D3117] px-1 hover:text-[#6C8C61] transition-colors flex items-center"
            >
              <OutlineLightBulbIcon className="w-5 h-5 mr-2 text-[#D87C6C] group-hover:text-[#6C8C61] transition-colors"/>
              Seasonal Tips
              <ChevronRightIcon className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestSeasonalTips.map(tip => (
                    <HomePageCard
                        key={tip.id}
                        title={tip.title}
                        description={tip.description || undefined}
                        imageUrl={tip.imageUrl}
                        imagePositionY={tip.imagePosY}
                        onClick={() => {
                            onNavigateToModule('seasonaltips');
                            onNavigateToRecentItem({ 
                                id: tip.id, 
                                item_id: tip.id, 
                                item_type: 'seasonal_tip', 
                                item_name: tip.title, 
                                item_image_url: tip.imageUrl || null, 
                                item_module_id: 'seasonaltips', 
                                viewed_at: new Date().toISOString() 
                            });
                        }}
                        itemType="seasonal_tip"
                        baseColorClass={'green'}
                    />
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;
