

import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent, EventType } from '../types';
import { MODULES } from '../constants';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

interface AddCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_completed' | 'event_types' | 'related_module' | 'related_entry_id'>, groundId?: string) => Promise<any>;
  eventTypes: EventType[];
  moduleConfig: typeof MODULES[0];
  groundId?: string; // Optional: To associate with a specific ground
}

const AddCalendarEventModal: React.FC<AddCalendarEventModalProps> = ({ 
    isOpen, onClose, onSave, eventTypes, moduleConfig, groundId
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTypeId, setEventTypeId] = useState<string | null>(eventTypes[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && eventTypes.length > 0 && !eventTypeId) {
      setEventTypeId(eventTypes[0].id);
    }
  }, [isOpen, eventTypes, eventTypeId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  if (!isOpen) return null;

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEventTypeId(eventTypes[0]?.id || null);
    setError(null);
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Event title is required.");
      return;
    }
    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    if (!eventTypeId) {
        setError("Event Type is required.");
        return;
    }
    setError(null);
    setIsSaving(true);
    try {
        await onSave({
            title: title.trim(),
            description: description.trim() || null,
            start_date: new Date(startDate + 'T00:00:00').toISOString(),
            end_date: null,
            event_type_id: eventTypeId,
            is_recurring: false,
            recurrence_rule: null,
        }, groundId);
        clearForm();
        onClose();
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save the event.");
    } finally {
        setIsSaving(false);
    }
  };
  
  const inputBaseClass = "w-full px-3 py-2.5 border border-[#B6B6B6] rounded-lg shadow-sm focus:outline-none sm:text-sm bg-white text-[#2C2C2C] placeholder-[#A67C52]";
  const inputFocusClass = `focus:ring-1 focus:ring-[#6C8C61] focus:border-[#6C8C61]`;
  const primaryButtonClass = `px-6 py-2 text-sm font-medium text-white bg-[#6C8C61] hover:bg-[#5a7850] rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#6C8C61] disabled:opacity-70`;
  const secondaryButtonClass = `px-4 py-2 text-sm font-medium text-[#6C8C61] hover:bg-[#DCEFD6] rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#6C8C61] disabled:opacity-70`;
  
  const selectedEventType = eventTypes.find(et => et.id === eventTypeId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col border border-[#E5E3DD]">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-[#1D3117]">Add Calendar Event</h2>
          <button type="button" onClick={() => { clearForm(); onClose();}} className="p-1.5 text-[#A67C52] hover:bg-[#E5E3DD] rounded-full" aria-label="Close modal">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3 p-2 bg-red-100 rounded-lg">{error}</p>}

        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label htmlFor="eventTitle" className="block text-xs font-medium text-[#A67C52] mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input type="text" id="eventTitle" value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputBaseClass} ${inputFocusClass}`} required />
          </div>

          <div>
            <label htmlFor="eventStartDate" className="block text-xs font-medium text-[#A67C52] mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input type="date" id="eventStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${inputBaseClass} ${inputFocusClass}`} required />
          </div>

          <div ref={dropdownRef} className="relative">
            <label htmlFor="eventType" className="block text-xs font-medium text-[#A67C52] mb-1">Event Type</label>
            <button
              type="button"
              id="eventType"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${inputBaseClass} ${inputFocusClass} text-left flex justify-between items-center`}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
                <span className="flex items-center">
                    <span className="w-6 text-xl text-center mr-2">{selectedEventType?.icon_name || '📝'}</span>
                    {selectedEventType?.name || 'Select a type...'}
                </span>
                <ChevronDownIcon className={`w-5 h-5 text-[#A67C52] transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" role="listbox">
                    {eventTypes.map(type => (
                        <li key={type.id}
                            onClick={() => { setEventTypeId(type.id); setIsDropdownOpen(false); }}
                            className="text-[#2C2C2C] cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-[#E5E3DD] flex items-center"
                            role="option"
                            aria-selected={eventTypeId === type.id}
                        >
                            <span className="w-6 text-xl text-center mr-3">{type.icon_name}</span>
                            <span className="font-normal block truncate">{type.name}</span>
                        </li>
                    ))}
                </ul>
            )}
          </div>

          <div>
            <label htmlFor="eventDescription" className="block text-xs font-medium text-[#A67C52] mb-1">Description (Optional)</label>
            <textarea id="eventDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputBaseClass} ${inputFocusClass} leading-relaxed`} />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-[#E5E3DD]">
          <button type="button" onClick={() => { clearForm(); onClose();}} className={secondaryButtonClass} disabled={isSaving}>Cancel</button>
          <button type="button" onClick={handleSubmit} className={primaryButtonClass} disabled={isSaving}>
            {isSaving ? <LoadingSpinner size="sm" color="text-white"/> : 'Save Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCalendarEventModal;
