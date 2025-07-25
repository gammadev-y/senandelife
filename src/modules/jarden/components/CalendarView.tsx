





import React, { useState, useMemo, useEffect } from 'react';
import { CalendarEventViewModel, WeatherLocationPreference } from '../types'; 
import { MONTH_ABBREVIATIONS, MODULES } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/outline';
import WeatherBanner from './WeatherBanner'; 
import LoadingSpinner from './LoadingSpinner';

interface CalendarViewProps {
  calendarEvents: CalendarEventViewModel[];
  moduleConfig: typeof MODULES[0]; 
  weatherLocationPreference: WeatherLocationPreference | null; 
  setIsDefineLocationModalOpen: (isOpen: boolean) => void;
  onUpdateCalendarEvent: (eventId: string, updates: Partial<CalendarEventViewModel>) => void;
}

interface DayCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEventViewModel[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ calendarEvents, moduleConfig, weatherLocationPreference, setIsDefineLocationModalOpen, onUpdateCalendarEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

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
    
    const grid: DayCell[] = [];
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); 

    for (let i = 0; i < 42; i++) { 
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      day.setHours(0,0,0,0);

      const dayEvents = calendarEvents.filter(event => {
        const eventDate = new Date(event.start_date); 
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
  }, [currentDate, calendarEvents, today]);

  const todaysTasks = useMemo(() => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      eventDate.setHours(0,0,0,0);
      return eventDate.getTime() === today.getTime() && event.status !== 'Completed';
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [calendarEvents, today]);

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
  
  const handleTaskCheckboxChange = async (taskId: string, isCompleted: boolean) => {
    setUpdatingTaskId(taskId);
    try {
      await onUpdateCalendarEvent(taskId, { is_completed: isCompleted });
    } catch (error) {
      console.error("Failed to update task status", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const renderTaskItem = (event: CalendarEventViewModel, isModal: boolean = false) => {
    const colorHex = event.event_types?.color_code || '#B6B6B6';
    const isCompleted = event.status === 'Completed';
    const isUpdatingThisTask = updatingTaskId === event.id;

    return (
      <li key={event.id} className={`p-3 rounded-lg ${isModal ? 'bg-[#E5E3DD]' : 'bg-white shadow-sm'} transition-all`} style={{borderLeft: `4px solid ${colorHex}`}}>
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-grow">
            {isModal && (
                <div className="flex items-center h-full pt-0.5 mr-2.5">
                    {isUpdatingThisTask ? (
                        <LoadingSpinner size="sm" color="text-[#6C8C61]" />
                    ) : (
                        <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(e) => handleTaskCheckboxChange(event.id, e.target.checked)}
                            className="h-4 w-4 rounded border-[#B6B6B6] text-[#6C8C61] focus:ring-[#6C8C61]"
                            aria-label={`Mark ${event.title} as ${isCompleted ? 'not completed' : 'completed'}`}
                        />
                    )}
                </div>
            )}
            <span className="w-5 h-5 mr-2.5 mt-0.5 text-lg flex items-center justify-center flex-shrink-0">{event.event_types?.icon_name || '📝'}</span>
            <div className="flex-grow">
              <h3 className={`font-medium text-sm ${isCompleted ? 'line-through text-[#A67C52]' : 'text-[#2C2C2C]'}`}>{event.title}</h3>
              {isModal && event.description && <p className={`text-xs mt-0.5 ${isCompleted ? 'text-[#B6B6B6]' : 'text-[#A67C52]'} whitespace-pre-wrap break-words`}>{event.description}</p>}
            </div>
          </div>
          {isModal && <span className={`text-xs font-medium whitespace-nowrap ml-2 ${isCompleted ? 'text-[#B6B6B6]' : 'text-[#A67C52]'}`}>{new Date(event.start_date).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric' })}</span>}
        </div>
        <div className={`text-xs text-[#A67C52] mt-1 ${isModal ? 'ml-[46px]' : 'ml-[29px]'}`}>
          Type: {event.event_types?.name || 'General'}
          {event.status && <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${isCompleted ? 'bg-green-100 text-green-800' : (event.status === 'Overdue' ? `bg-red-100 text-red-800` : `bg-yellow-100 text-yellow-800`)}`}>{event.status}</span>}
        </div>
      </li>
    );
  };

  return (
    <div className="p-3 md:p-4 lg:p-6 h-full flex flex-col custom-scrollbar">
      <div className="mb-4">
        <WeatherBanner 
          weatherLocationPreference={weatherLocationPreference}
          setIsDefineLocationModalOpen={setIsDefineLocationModalOpen} 
        />
      </div>
      
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-[#E5E3DD] text-[#A67C52] transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-[#1D3117]">
          {currentMonthName} <span className="text-[#A67C52]">{currentYear}</span>
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-[#E5E3DD] text-[#A67C52] transition-colors"
          aria-label="Next month"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-grow grid grid-cols-7 grid-rows-6 gap-px border border-[#E5E3DD] bg-[#E5E3DD] rounded-xl shadow-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="text-xs font-medium text-center py-2 bg-[#FDFCF9] text-[#A67C52]">
            {dayName}
          </div>
        ))}
        {daysInMonthGrid.map((day, index) => (
          <div
            key={index}
            className={`p-1.5 md:p-2 relative flex flex-col cursor-pointer transition-colors duration-150 
                        ${day.isCurrentMonth ? 'bg-white hover:bg-[#FDFCF9]' : 'bg-[#f8f8f6] text-[#B6B6B6] hover:bg-[#FDFCF9]'}
                        ${day.isToday ? `ring-2 ring-inset ring-[#6C8C61]` : ''}`}
            onClick={() => handleDayClick(day)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDayClick(day)}
            role="button"
            tabIndex={0}
            aria-label={`Date ${day.dayOfMonth}, ${day.events.length} tasks`}
          >
            <span className={`text-xs font-medium ${day.isToday ? `text-[#6C8C61] font-bold` : (day.isCurrentMonth ? 'text-[#2C2C2C]' : 'text-[#B6B6B6]')}`}>
              {day.dayOfMonth}
            </span>
            {day.events.length > 0 && (
              <div className="mt-1 space-y-0.5 overflow-y-auto max-h-[60px] md:max-h-[80px] custom-scrollbar-xs">
                {day.events.slice(0, 2).map(event => {
                  const isCompleted = event.status === 'Completed';
                  const colorHex = event.event_types?.color_code || '#B6B6B6';
                  return (
                    <div key={event.id} className={`flex items-center p-0.5 md:p-1 rounded-md text-xs truncate ${isCompleted ? 'bg-[#E5E3DD] opacity-60' : 'bg-opacity-20'}`} style={{ backgroundColor: isCompleted ? undefined : `${colorHex}33`}}>
                      <span className={`w-3 h-3 mr-1 flex-shrink-0 text-xs flex items-center justify-center ${isCompleted ? 'opacity-50' : ''}`}>{event.event_types?.icon_name || '📝'}</span>
                      <span className={`truncate ${isCompleted ? 'line-through text-[#A67C52]' : `text-[#2C2C2C]`}`}>
                        {event.title}
                      </span>
                    </div>
                  );
                })}
                {day.events.length > 2 && (
                  <div className="text-[10px] text-center text-[#A67C52] mt-0.5">
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
            <h3 className="text-md font-semibold mb-2 text-[#1D3117] px-1 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-[#A67C52]" />
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
          <div className="bg-[#FDFCF9] p-5 md:p-6 rounded-2xl shadow-xl w-full max-w-md transform transition-all max-h-[80vh] flex flex-col border border-[#E5E3DD]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1D3117]">
                Tasks for {selectedDateForModal.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-[#A67C52] hover:bg-[#E5E3DD] rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <ul className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
              {daysInMonthGrid.find(day => day.date.getTime() === selectedDateForModal.getTime())?.events.map(event => renderTaskItem(event, true))}
            </ul>
            {daysInMonthGrid.find(day => day.date.getTime() === selectedDateForModal.getTime())?.events.length === 0 && (
                <p className="text-sm text-[#A67C52] text-center py-4">No tasks scheduled for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
