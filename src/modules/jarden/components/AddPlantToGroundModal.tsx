



import React, { useState, useEffect } from 'react';
import { Plant, PlantInput, GrowingGroundPlant, PlantStage } from '../types';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { MODULES, PLANT_STAGES } from '../constants';


interface AddPlantToGroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { plantId?: string; newPlantInput?: PlantInput; quantity: number; datePlanted: string; notes?: string; status: PlantStage }) => void;
  groundId: string;
  existingPlants: Plant[];
  onAddNewPlant: () => void; 
  moduleConfig: typeof MODULES[0];
}

const AddPlantToGroundModal: React.FC<AddPlantToGroundModalProps> = ({ 
  isOpen, onClose, onSave, groundId, existingPlants, onAddNewPlant, moduleConfig
}) => {
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [datePlanted, setDatePlanted] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<PlantStage>(PLANT_STAGES[0]);
  const [error, setError] = useState<string | null>(null);

  const focusRingClass = `focus:ring-[#6C8C61]`;
  const focusBorderClass = `focus:border-[#6C8C61]`;
  const activeTabClass = `border-[#6C8C61] text-[#6C8C61]`;
  const selectedItemBgClass = `bg-[#DCEFD6]`;
  const selectedItemTextClass = `text-[#1D3117]`;
  const primaryButtonBgClass = `bg-[#6C8C61] hover:bg-[#5a7850]`;
  const primaryButtonRingClass = `focus:ring-[#6C8C61]`;


  useEffect(() => {
    if (isOpen) { // Reset form on open
      setSelectedPlantId(null);
      setSearchTerm('');
      setQuantity(1);
      setDatePlanted(new Date().toISOString().slice(0, 10));
      setNotes('');
      setStatus(PLANT_STAGES[0]);
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
  
  const inputBaseStyles = `block w-full px-3 py-2.5 border border-[#B6B6B6] rounded-2xl shadow-sm focus:outline-none sm:text-sm bg-white text-[#2C2C2C] placeholder-[#A67C52] ${focusRingClass} ${focusBorderClass}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xl transform transition-all max-h-[90vh] flex flex-col border border-[#E5E3DD]">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-[#1D3117]">Add Plant to Ground</h2>
          <button onClick={onClose} className="p-1.5 text-[#A67C52] hover:bg-[#E5E3DD] rounded-full transition-colors duration-200 ease-in-out" aria-label="Close modal">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 border-b border-[#E5E3DD]">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button
                    onClick={() => setMode('select')}
                    className={`${mode === 'select' ? activeTabClass : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ease-in-out`}
                >
                    Select Existing Plant
                </button>
                <button
                    onClick={() => {
                        setMode('create');
                        onAddNewPlant();
                        onClose(); 
                    }}
                    className={`${mode === 'create' ? activeTabClass : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ease-in-out`}
                >
                    Create New Plant Entry
                </button>
            </nav>
        </div>

        {error && <p className="text-red-600 text-sm mb-3 p-2 bg-red-100 rounded-lg">{error}</p>}

        {mode === 'select' && (
          <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
            <div>
              <label htmlFor="plantSearch" className="block text-xs font-medium text-[#A67C52] mb-1">Search Existing Plants</label>
              <div className="mt-1 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-[#A67C52]" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="plantSearch"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or scientific name..."
                  className={`block w-full pl-10 pr-3 py-2.5 border border-[#B6B6B6] rounded-2xl focus:outline-none ${focusRingClass} ${focusBorderClass} sm:text-sm bg-white text-[#2C2C2C] placeholder-[#A67C52]`}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-[#B6B6B6] rounded-2xl p-1.5 space-y-1 custom-scrollbar">
              {filteredExistingPlants.length > 0 ? filteredExistingPlants.map(plant => (
                <button
                  key={plant.id}
                  onClick={() => setSelectedPlantId(plant.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-colors duration-200 ease-in-out ${selectedPlantId === plant.id ? `${selectedItemBgClass} ${selectedItemTextClass}` : 'hover:bg-[#E5E3DD] text-[#2C2C2C]'}`}
                >
                  {plant.plant_identification_overview.common_names[0] || 'Unnamed Plant'} <span className="text-xs text-[#A67C52]">({plant.plant_identification_overview.latin_name_scientific_name || 'N/A'})</span>
                </button>
              )) : <p className="text-sm text-[#A67C52] p-2.5">No plants match your search.</p>}
            </div>
            
            {selectedPlantId && (
                <>
                    <div>
                        <label htmlFor="quantity" className="block text-xs font-medium text-[#A67C52] mb-1">Quantity</label>
                        <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} min="1" className={`mt-1 ${inputBaseStyles}`} />
                    </div>
                    <div>
                        <label htmlFor="datePlanted" className="block text-xs font-medium text-[#A67C52] mb-1">Date Planted</label>
                        <input type="date" id="datePlanted" value={datePlanted} onChange={(e) => setDatePlanted(e.target.value)} className={`mt-1 ${inputBaseStyles}`} />
                    </div>
                    <div>
                        <label htmlFor="plantStatus" className="block text-xs font-medium text-[#A67C52] mb-1">Initial Stage</label>
                        <select id="plantStatus" value={status} onChange={(e) => setStatus(e.target.value as PlantStage)} className={`mt-1 ${inputBaseStyles} appearance-none`}>
                            {PLANT_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="plantNotes" className="block text-xs font-medium text-[#A67C52] mb-1">Notes (Optional)</label>
                        <textarea id="plantNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`mt-1 ${inputBaseStyles} leading-relaxed`} />
                    </div>
                </>
            )}
          </div>
        )}
        
        {mode === 'create' && (
            <div className="text-center py-8">
                <p className="text-[#A67C52]">Redirecting to create a new plant...</p>
            </div>
        )}


        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-[#E5E3DD]">
          <button type="button" onClick={onClose} className={`px-4 py-2 text-sm font-medium text-[#6C8C61] hover:bg-[#DCEFD6] rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#6C8C61] transition-all duration-200 ease-in-out`}>
            Cancel
          </button>
          {mode === 'select' && (
            <button type="button" onClick={handleSubmit} disabled={!selectedPlantId} className={`px-6 py-2 text-sm font-medium text-white ${primaryButtonBgClass} rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${primaryButtonRingClass} disabled:opacity-50 transition-all duration-200 ease-in-out`}>
              Add to Ground
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPlantToGroundModal;