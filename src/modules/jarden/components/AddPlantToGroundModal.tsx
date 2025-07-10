
import React, { useState, useEffect } from 'react';
import { Plant, PlantInput, GrowingGroundPlant } from '../types';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { MODULES } from '../constants';


interface AddPlantToGroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { plantId?: string; newPlantInput?: PlantInput; quantity: number; datePlanted: string; notes?: string; status: GrowingGroundPlant['status'] }) => void;
  groundId: string;
  existingPlants: Plant[];
  onAddNewPlant: () => void; 
  moduleConfig: typeof MODULES[0];
}

const PLANT_STATUSES: GrowingGroundPlant['status'][] = ['Planning', 'Seeded', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Dormant', 'Harvested', 'Failed', 'Removed'];


const AddPlantToGroundModal: React.FC<AddPlantToGroundModalProps> = ({ 
  isOpen, onClose, onSave, groundId, existingPlants, onAddNewPlant, moduleConfig
}) => {
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [datePlanted, setDatePlanted] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<GrowingGroundPlant['status']>(PLANT_STATUSES[0]);
  const [error, setError] = useState<string | null>(null);

  // Use moduleConfig.baseColorClass for consistent theming
  const focusRingClass = `focus:ring-${moduleConfig.baseColorClass}-500 dark:focus:ring-${moduleConfig.baseColorClass}-400`;
  const focusBorderClass = `focus:border-${moduleConfig.baseColorClass}-500 dark:focus:border-${moduleConfig.baseColorClass}-400`;
  const activeTabClass = `border-${moduleConfig.baseColorClass}-500 text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-400`;
  const selectedItemBgClass = `bg-${moduleConfig.baseColorClass}-100 dark:bg-${moduleConfig.baseColorClass}-700/50`;
  const selectedItemTextClass = `text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-200`;
  const primaryButtonBgClass = `bg-${moduleConfig.baseColorClass}-600 hover:bg-${moduleConfig.baseColorClass}-700 dark:bg-${moduleConfig.baseColorClass}-500 dark:hover:bg-${moduleConfig.baseColorClass}-600`;
  const primaryButtonRingClass = `focus:ring-${moduleConfig.baseColorClass}-500`;


  useEffect(() => {
    if (isOpen) { // Reset form on open
      setSelectedPlantId(null);
      setSearchTerm('');
      setQuantity(1);
      setDatePlanted(new Date().toISOString().slice(0, 10));
      setNotes('');
      setStatus(PLANT_STATUSES[0]);
      setError(null);
      setMode('select'); // Default to select mode
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredExistingPlants = existingPlants.filter(p =>
    (p.plant_identification_overview.common_names[0] && p.plant_identification_overview.common_names[0].toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.plant_identification_overview.latin_name_scientific_name && p.plant_identification_overview.latin_name_scientific_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = () => {
    setError(null);
    if (mode === 'select' && !selectedPlantId) {
      setError("Please select an existing plant.");
      return;
    }
    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }
    if (!datePlanted) {
      setError("Date planted is required.");
      return;
    }

    if (mode === 'select' && selectedPlantId) {
      onSave({ 
        plantId: selectedPlantId, 
        quantity, 
        datePlanted, 
        notes: notes.trim() || undefined,
        status
      });
    } else if (mode === 'create') {
      onAddNewPlant(); 
    }
  };
  
  const inputBaseStyles = `block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none sm:text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 ${focusRingClass} ${focusBorderClass}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">Add Plant to Ground</h2>
          <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" aria-label="Close modal">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 border-b border-slate-300 dark:border-slate-700">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button
                    onClick={() => setMode('select')}
                    className={`${mode === 'select' ? activeTabClass : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                    Select Existing Plant
                </button>
                <button
                    onClick={() => {
                        setMode('create');
                        onAddNewPlant();
                        onClose(); 
                    }}
                    className={`${mode === 'create' ? activeTabClass : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                    Create New Plant Entry
                </button>
            </nav>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</p>}

        {mode === 'select' && (
          <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
            <div>
              <label htmlFor="plantSearch" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Search Existing Plants</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="plantSearch"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or scientific name..."
                  className={`block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none ${focusRingClass} ${focusBorderClass} sm:text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400`}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 space-y-1 custom-scrollbar">
              {filteredExistingPlants.length > 0 ? filteredExistingPlants.map(plant => (
                <button
                  key={plant.id}
                  onClick={() => setSelectedPlantId(plant.id)}
                  className={`w-full text-left p-2.5 rounded-md transition-colors ${selectedPlantId === plant.id ? `${selectedItemBgClass} ${selectedItemTextClass}` : 'hover:bg-slate-200 dark:hover:bg-slate-700/70 text-slate-800 dark:text-slate-100'}`}
                >
                  {plant.plant_identification_overview.common_names[0] || 'Unnamed Plant'} <span className="text-xs text-slate-500 dark:text-slate-400">({plant.plant_identification_overview.latin_name_scientific_name || 'N/A'})</span>
                </button>
              )) : <p className="text-sm text-slate-500 dark:text-slate-400 p-2.5">No plants match your search.</p>}
            </div>
            
            {selectedPlantId && (
                <>
                    <div>
                        <label htmlFor="quantity" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Quantity</label>
                        <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} min="1" className={`mt-1 ${inputBaseStyles}`} />
                    </div>
                    <div>
                        <label htmlFor="datePlanted" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Date Planted</label>
                        <input type="date" id="datePlanted" value={datePlanted} onChange={(e) => setDatePlanted(e.target.value)} className={`mt-1 ${inputBaseStyles}`} />
                    </div>
                    <div>
                        <label htmlFor="plantStatus" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Status</label>
                        <select id="plantStatus" value={status} onChange={(e) => setStatus(e.target.value as GrowingGroundPlant['status'])} className={`mt-1 ${inputBaseStyles} appearance-none`}>
                            {PLANT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="plantNotes" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Notes (Optional)</label>
                        <textarea id="plantNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`mt-1 ${inputBaseStyles} leading-relaxed`} />
                    </div>
                </>
            )}
          </div>
        )}
        
        {mode === 'create' && (
            <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-300">Redirecting to create a new plant...</p>
            </div>
        )}


        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-300 dark:border-slate-700">
          <button type="button" onClick={onClose} className={`px-4 py-2 text-sm font-medium text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-300 hover:bg-${moduleConfig.baseColorClass}-100 dark:hover:bg-${moduleConfig.baseColorClass}-700/30 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${moduleConfig.baseColorClass}-400`}>
            Cancel
          </button>
          {mode === 'select' && (
            <button type="button" onClick={handleSubmit} disabled={!selectedPlantId} className={`px-6 py-2 text-sm font-medium text-white ${primaryButtonBgClass} rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 ${primaryButtonRingClass} disabled:opacity-50`}>
              Add to Ground
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPlantToGroundModal;
