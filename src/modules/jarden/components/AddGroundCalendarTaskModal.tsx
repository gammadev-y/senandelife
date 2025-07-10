
import React, { useState } from 'react';
import { GroundCalendarTask, GroundLogActionType, GrowingGroundPlant, Plant } from '../types';
import { GROUND_LOG_ACTION_TYPES, MODULES } from '../constants';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddGroundCalendarTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<GroundCalendarTask, 'id' | 'status'>) => void;
  groundId: string;
  plantsInGround: GrowingGroundPlant[];
  allPlants: Plant[]; 
  moduleConfig: typeof MODULES[0];
}

const AddGroundCalendarTaskModal: React.FC<AddGroundCalendarTaskModalProps> = ({ 
    isOpen, onClose, onSave, groundId, plantsInGround, allPlants, moduleConfig
}) => {
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [actionType, setActionType] = useState<GroundLogActionType>(GROUND_LOG_ACTION_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getPlantNameById = (plantId: string): string => {
    const plant = allPlants.find(p => p.id === plantId);
    return plant ? (plant.plant_identification_overview.common_names[0] || 'Unknown Plant') : 'Unknown Plant';
  };
  
  const clearForm = () => {
    setDescription('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setActionType(GROUND_LOG_ACTION_TYPES[0]);
    setNotes('');
    setSelectedPlantIds([]);
    setError(null);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      setError("Task description is required.");
      return;
    }
    if (!dueDate) {
      setError("Due date is required.");
      return;
    }
    setError(null);
    onSave({
      description: description.trim(),
      dueDate,
      actionType,
      notes: notes.trim() || undefined,
      relatedPlantIds: selectedPlantIds.length > 0 ? selectedPlantIds : undefined,
    });
    clearForm();
  };

  const handlePlantSelection = (plantId: string) => {
    setSelectedPlantIds(prev => 
      prev.includes(plantId) ? prev.filter(id => id !== plantId) : [...prev, plantId]
    );
  };
  
  const inputBaseClass = "w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none sm:text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400";
  const inputFocusClass = `focus:ring-${moduleConfig.baseColorClass}-500 focus:border-${moduleConfig.baseColorClass}-500 dark:focus:ring-${moduleConfig.baseColorClass}-400 dark:focus:border-${moduleConfig.baseColorClass}-400`;
  const checkboxClass = `h-4 w-4 text-${moduleConfig.baseColorClass}-600 border-slate-300 dark:border-slate-500 rounded focus:ring-${moduleConfig.baseColorClass}-500 dark:focus:ring-${moduleConfig.baseColorClass}-400`;


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">Add Calendar Task</h2>
          <button onClick={() => { clearForm(); onClose();}} className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" aria-label="Close modal">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</p>}

        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label htmlFor="taskDescription" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputBaseClass} ${inputFocusClass}`}
              required
            />
          </div>

          <div>
            <label htmlFor="taskDueDate" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="taskDueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${inputBaseClass} ${inputFocusClass}`}
              required
            />
          </div>

          <div>
            <label htmlFor="taskActionType" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Action Type</label>
            <select
              id="taskActionType"
              value={actionType}
              onChange={(e) => setActionType(e.target.value as GroundLogActionType)}
              className={`${inputBaseClass} ${inputFocusClass} appearance-none`}
            >
              {GROUND_LOG_ACTION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {plantsInGround.length > 0 && (
            <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Related Plants (Optional)</label>
                <div className="mt-1 space-y-1.5 max-h-32 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-slate-100 dark:bg-slate-700/50">
                    {plantsInGround.map(gp => (
                        <div key={gp.plantId} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`relatedPlant-${gp.plantId}`}
                                checked={selectedPlantIds.includes(gp.plantId)}
                                onChange={() => handlePlantSelection(gp.plantId)}
                                className={checkboxClass}
                            />
                            <label htmlFor={`relatedPlant-${gp.plantId}`} className="ml-2.5 text-sm text-slate-700 dark:text-slate-200">
                                {getPlantNameById(gp.plantId)}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
          )}


          <div>
            <label htmlFor="taskNotes" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Notes (Optional)</label>
            <textarea
              id="taskNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`${inputBaseClass} ${inputFocusClass} leading-relaxed`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-300 dark:border-slate-700">
          <button type="button" onClick={() => { clearForm(); onClose();}} 
            className={`px-4 py-2 text-sm font-medium text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-300 hover:bg-${moduleConfig.baseColorClass}-100 dark:hover:bg-${moduleConfig.baseColorClass}-700/30 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${moduleConfig.baseColorClass}-400`}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} 
            className={`px-6 py-2 text-sm font-medium text-white bg-${moduleConfig.baseColorClass}-600 hover:bg-${moduleConfig.baseColorClass}-700 dark:bg-${moduleConfig.baseColorClass}-500 dark:hover:bg-${moduleConfig.baseColorClass}-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-${moduleConfig.baseColorClass}-500`}>
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroundCalendarTaskModal;
