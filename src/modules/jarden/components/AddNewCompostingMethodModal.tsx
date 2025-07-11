
import React, { useState, useRef } from 'react';
import { CompostingMethodInput, CompostingMethod } from '../types';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64 } from '../utils/imageUtils';
import { MODULES } from '../constants';

interface AddNewCompostingMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (methodInput: CompostingMethodInput) => void;
  moduleConfig: typeof MODULES[0];
}

const COMPOSTING_APPROACHES: CompostingMethod['primary_composting_approach'][] = [
  'Aerobic (Hot Pile)', 'Aerobic (Cold Pile)', 'Aerobic (Tumbler)', 
  'Anaerobic (Bokashi)', 'Vermicomposting (Worm Farm)', 'Sheet Mulching (Lasagna)', 
  'Trench Composting', 'Other'
];

const AddNewCompostingMethodModal: React.FC<AddNewCompostingMethodModalProps> = ({ isOpen, onClose, onSave, moduleConfig }) => {
  const [name, setName] = useState('');
  const [approach, setApproach] = useState<CompostingMethod['primary_composting_approach']>(COMPOSTING_APPROACHES[0]);
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setImageBase64(base64);
        setError(null);
      } catch (err) {
        console.error("Error converting file to base64:", err);
        setError("Failed to load image. Please try another file.");
        setImageBase64(null);
      }
    }
  };
  
  const clearForm = () => {
    setName('');
    setApproach(COMPOSTING_APPROACHES[0]);
    setDescription('');
    setImageBase64(null);
    setError(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Method name is required.");
      return;
    }
    setError(null);
    onSave({
      name: name.trim(),
      approach: approach,
      description: description.trim() || undefined,
      imageUrl: imageBase64 || undefined,
    });
    clearForm();
  };
  
  const inputBaseClass = "w-full px-3 py-2.5 border-0 border-b-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none sm:text-sm transition-colors";
  const inputFocusClass = `focus:border-${moduleConfig.baseColorClass}-500 dark:focus:border-${moduleConfig.baseColorClass}-400 focus:ring-0 focus:bg-slate-50 dark:focus:bg-slate-600/50`;
  const inputErrorClass = "border-red-500 dark:border-red-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">Add New Composting Method</h2>
          <button
            onClick={() => { clearForm(); onClose(); }}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 ease-in-out"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</p>}

        <div className="space-y-5 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label htmlFor="methodName" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Method Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="methodName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputBaseClass} ${name.trim() || !error ? inputFocusClass : inputErrorClass} rounded-t-lg`}
              required
            />
          </div>
          <div>
            <label htmlFor="methodApproach" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Approach</label>
            <select id="methodApproach" value={approach} onChange={(e) => setApproach(e.target.value as CompostingMethod['primary_composting_approach'])} className={`${inputBaseClass} ${inputFocusClass} rounded-lg appearance-none`}>
                {COMPOSTING_APPROACHES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Method Image</label>
            <div className="mt-1 flex items-center space-x-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              {imageBase64 ? (
                <img src={imageBase64} alt="Preview" className="w-20 h-20 rounded-lg object-cover shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  <PhotoIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="compostMethodImageUploadModal"
                />
                 <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-3 py-1.5 text-xs font-medium text-${moduleConfig.baseColorClass}-700 bg-${moduleConfig.baseColorClass}-100 hover:bg-${moduleConfig.baseColorClass}-200 dark:text-${moduleConfig.baseColorClass}-800 dark:bg-${moduleConfig.baseColorClass}-300 dark:hover:bg-${moduleConfig.baseColorClass}-400 rounded-full shadow-sm flex items-center transition-all duration-200 ease-in-out`}
                >
                    <ArrowUpTrayIcon className="w-4 h-4 mr-1.5" />
                    Upload
                </button>
                {imageBase64 && (
                    <button
                        type="button"
                        onClick={() => {
                            setImageBase64(null);
                            if(fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-all duration-200 ease-in-out"
                    >
                        Remove
                    </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="methodDescription" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="methodDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputBaseClass} ${inputFocusClass} rounded-t-lg leading-relaxed`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => { clearForm(); onClose(); }}
            className={`px-4 py-2 text-sm font-medium text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-300 hover:bg-${moduleConfig.baseColorClass}-100 dark:hover:bg-${moduleConfig.baseColorClass}-700/30 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${moduleConfig.baseColorClass}-400 transition-all duration-200 ease-in-out`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-6 py-2 text-sm font-medium text-black bg-${moduleConfig.baseColorClass}-500 hover:bg-${moduleConfig.baseColorClass}-600 dark:bg-${moduleConfig.baseColorClass}-400 dark:hover:bg-${moduleConfig.baseColorClass}-500 dark:text-slate-900 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-${moduleConfig.baseColorClass}-500 transition-all duration-200 ease-in-out`}
          >
            Save Method
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewCompostingMethodModal;
