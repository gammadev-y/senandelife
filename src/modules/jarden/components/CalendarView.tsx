
import React, { useState, useMemo, useEffect } from 'react';
import { CalendarEvent, GroundLogActionType, WeatherLocationPreference } from '../types'; 
import { MONTH_ABBREVIATIONS, GROUND_LOG_ACTION_TYPE_ICONS, MODULES } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon, CheckCircleIcon as SolidCheckCircleIcon, ClockIcon, XMarkIcon, ClipboardDocumentListIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import WeatherBanner from './WeatherBanner'; 

interface CalendarViewProps {
  events: CalendarEvent[];
  moduleConfig: typeof MODULES[0]; 
  weatherLocationPreference: WeatherLocationPreference | null; 
  setIsDefineLocationModalOpen: (isOpen: boolean) => void; 
}

interface DayCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, moduleConfig, weatherLocationPreference, setIsDefineLocationModalOpen }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const currentMonthName = MONTH_ABBREVIATIONS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const changeMonth = (delta: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const daysInMonthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const grid: DayCell[] = [];
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); 

    for (let i = 0; i < 42; i++) { 
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      day.setHours(0,0,0,0);

      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00'); 
        eventDate.setHours(0,0,0,0);
        return eventDate.getTime() === day.getTime();
      });
      
      grid.push({
        date: day,
        dayOfMonth: day.getDate(),
        isCurrentMonth: day.getMonth() === month,
        isToday: day.getTime() === today.getTime(),
        events: dayEvents,
      });
    }
    return grid;
  }, [currentDate, events, today]);

  const todaysTasks = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date + 'T00:00:00');
      eventDate.setHours(0,0,0,0);
      return eventDate.getTime() === today.getTime() && !event.isCompleted; // Show only pending tasks for today
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [events, today]);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 6);

  const restOfWeekTasks = events.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    eventDate.setHours(0,0,0,0);
    return eventDate >= tomorrow && eventDate <= endOfWeek && !event.isCompleted;
  }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.title.localeCompare(b.title));


  const getTaskIcon = (event: CalendarEvent): React.FC<React.SVGProps<SVGSVGElement>> => {
    return GROUND_LOG_ACTION_TYPE_ICONS[event.taskType] || InformationCircleIcon;
  };

  const handleDayClick = (day: DayCell) => {
    if (day.events.length > 0) {
      setSelectedDateForModal(day.date);
      setIsTaskDetailModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsTaskDetailModalOpen(false);
    setSelectedDateForModal(null);
  };

  const renderTaskItem = (event: CalendarEvent, isModal: boolean = false) => {
    const EventIcon = getTaskIcon(event);
    const itemColor = event.color.startsWith('bg-') ? event.color.split('-')[1] : 'gray';
    const textColorClass = `text-${itemColor}-700 dark:text-${itemColor}-300`;
    const iconColorClass = `text-${itemColor}-600 dark:text-${itemColor}-400`;
    
    return (
      <li key={event.id} className={`p-3 rounded-lg ${isModal ? 'bg-slate-100 dark:bg-slate-700/70' : 'bg-white dark:bg-slate-800 shadow-sm'} transition-all`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <EventIcon className={`w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0 ${event.isCompleted ? 'text-slate-400 dark:text-slate-500' : iconColorClass}`} />
            <div className="flex-grow">
              <h3 className={`font-medium text-sm ${event.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : textColorClass}`}>{event.title}</h3>
              {isModal && event.description && <p className={`text-xs mt-0.5 ${event.isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'} whitespace-pre-wrap break-words`}>{event.description}</p>}
            </div>
          </div>
          {isModal && <span className={`text-xs font-medium whitespace-nowrap ml-2 ${event.isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>{new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 ml-7.5">
          Source: {event.sourceName} ({event.sourceModule})
          {event.sourceModule === 'Ground' && event.status && <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${event.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : (event.status === 'Overdue' ? `bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200` : `bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200`)}`}>{event.status}</span>}
        </div>
      </li>
    );
  };

  return (
    <div className="p-3 md:p-4 lg:p-6 h-full flex flex-col bg-slate-50 dark:bg-slate-900 custom-scrollbar">
      <div className="mb-4">
        <WeatherBanner 
          weatherLocationPreference={weatherLocationPreference}
          setIsDefineLocationModalOpen={setIsDefineLocationModalOpen} 
        />
      </div>
      
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
          {currentMonthName} <span className="text-slate-500 dark:text-slate-400">{currentYear}</span>
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Next month"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-grow grid grid-cols-7 grid-rows-6 gap-px border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="text-xs font-medium text-center py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {dayName}
          </div>
        ))}
        {daysInMonthGrid.map((day, index) => (
          <div
            key={index}
            className={`p-1.5 md:p-2 relative flex flex-col cursor-pointer transition-colors duration-150 
                        ${day.isCurrentMonth ? 'bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-700' : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/60'}
                        ${day.isToday ? `ring-2 ring-inset ring-${moduleConfig.baseColorClass}-500 dark:ring-${moduleConfig.baseColorClass}-400` : ''}`}
            onClick={() => handleDayClick(day)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDayClick(day)}
            role="button"
            tabIndex={0}
            aria-label={`Date ${day.dayOfMonth}, ${day.events.length} tasks`}
          >
            <span className={`text-xs font-medium ${day.isToday ? `text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-300 font-bold` : (day.isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500')}`}>
              {day.dayOfMonth}
            </span>
            {day.events.length > 0 && (
              <div className="mt-1 space-y-0.5 overflow-y-auto max-h-[60px] md:max-h-[80px] custom-scrollbar-xs">
                {day.events.slice(0, 2).map(event => {
                  const EventIcon = getTaskIcon(event);
                  const itemColor = event.color.startsWith('bg-') ? event.color.split('-')[1] : 'gray';
                  const iconColorClass = event.isCompleted ? 'text-slate-400 dark:text-slate-500' : `text-${itemColor}-500 dark:text-${itemColor}-400`;
                  return (
                    <div key={event.id} className={`flex items-center p-0.5 md:p-1 rounded-md text-xs truncate ${event.isCompleted ? 'bg-slate-100 dark:bg-slate-700/50 opacity-60' : `${event.color.replace('bg-','bg-opacity-20 dark:bg-opacity-30')} bg-opacity-20 dark:bg-opacity-30`}`}>
                      <EventIcon className={`w-3 h-3 mr-1 flex-shrink-0 ${iconColorClass}`} />
                      <span className={`truncate ${event.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : `text-${itemColor}-700 dark:text-${itemColor}-300`}`}>
                        {event.title}
                      </span>
                    </div>
                  );
                })}
                {day.events.length > 2 && (
                  <div className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-0.5">
                    + {day.events.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Today's Tasks Section (condensed view) */}
      {todaysTasks.length > 0 && !selectedDateForModal && (
         <div className="mt-6">
            <h3 className="text-md font-semibold mb-2 text-slate-700 dark:text-slate-200 px-1 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
              Remaining Today ({todaysTasks.length})
            </h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {todaysTasks.map(task => renderTaskItem(task))}
            </ul>
        </div>
      )}
      
      {/* Task Detail Modal */}
      {isTaskDetailModalOpen && selectedDateForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={closeModal}>
          <div className="bg-slate-50 dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-xl w-full max-w-md transform transition-all max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Tasks for {selectedDateForModal.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <ul className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
              {daysInMonthGrid.find(day => day.date.getTime() === selectedDateForModal.getTime())?.events.map(event => renderTaskItem(event, true))}
            </ul>
            {daysInMonthGrid.find(day => day.date.getTime() === selectedDateForModal.getTime())?.events.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No tasks scheduled for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
