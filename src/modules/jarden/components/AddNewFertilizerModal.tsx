
import React, { useState, useRef } from 'react';
import { FertilizerInput, Fertilizer } from '../types';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';
import { MODULES } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface AddNewFertilizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fertilizerInput: FertilizerInput) => Promise<any>;
  moduleConfig: typeof MODULES[0];
}

const FERTILIZER_TYPES: Fertilizer['type'][] = ['Organic', 'Synthetic', 'Mineral', 'Soil Amendment', 'Other'];
const FERTILIZER_FORMS: Fertilizer['form'][] = ['Liquid', 'Granular', 'Powder', 'Spike', 'Meal', 'Tea', 'Other'];


const AddNewFertilizerModal: React.FC<AddNewFertilizerModalProps> = ({ isOpen, onClose, onSave, moduleConfig }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Fertilizer['type']>(FERTILIZER_TYPES[0]);
  const [form, setForm] = useState<Fertilizer['form']>(FERTILIZER_FORMS[0]);
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setError(null);
        const compressedFile = await compressFileBeforeUpload(file);
        const base64 = await convertFileToBase64(compressedFile);
        setImageBase64(base64);
      } catch (err) {
        console.error("Error processing file:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load image. Please try another file.";
        setError(errorMessage);
        setImageBase64(null);
      }
    }
  };

  const clearForm = () => {
    setName('');
    setType(FERTILIZER_TYPES[0]);
    setForm(FERTILIZER_FORMS[0]);
    setDescription('');
    setImageBase64(null);
    setError(null);
    setIsSaving(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Fertilizer name is required.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type: type,
        form: form,
        description: description.trim() || undefined,
        imageUrl: imageBase64 || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const inputBaseClass = "w-full px-3 py-2.5 border-0 border-b-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none sm:text-sm transition-colors";
  const inputFocusClass = `focus:border-${moduleConfig.baseColorClass}-500 dark:focus:border-${moduleConfig.baseColorClass}-400 focus:ring-0 focus:bg-slate-50 dark:focus:bg-slate-600/50`;
  const inputErrorClass = "border-red-500 dark:border-red-400";


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">Add New Fertilizer</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 ease-in-out"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</p>}

        <div className="space-y-5 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label htmlFor="fertilizerName" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Fertilizer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fertilizerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputBaseClass} ${name.trim() || !error ? inputFocusClass : inputErrorClass} rounded-t-lg`}
              required
            />
          </div>
          <div>
            <label htmlFor="fertilizerType" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Type</label>
            <select id="fertilizerType" value={type} onChange={(e) => setType(e.target.value as Fertilizer['type'])}  className={`${inputBaseClass} ${inputFocusClass} rounded-lg appearance-none`}>
                {FERTILIZER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="fertilizerForm" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Form</label>
            <select id="fertilizerForm" value={form} onChange={(e) => setForm(e.target.value as Fertilizer['form'])}  className={`${inputBaseClass} ${inputFocusClass} rounded-lg appearance-none`}>
                {FERTILIZER_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Fertilizer Image</label>
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
                    id="fertilizerImageUploadModal"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                     className={`px-3 py-1.5 text-xs font-medium text-${moduleConfig.baseColorClass}-700 bg-${moduleConfig.baseColorClass}-100 hover:bg-${moduleConfig.baseColorClass}-200 dark:text-${moduleConfig.baseColorClass}-200 dark:bg-${moduleConfig.baseColorClass}-700 dark:hover:bg-${moduleConfig.baseColorClass}-600 rounded-full shadow-sm flex items-center transition-all duration-200 ease-in-out`}
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
            <label htmlFor="fertilizerDescription" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="fertilizerDescription"
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
            onClick={handleClose}
            disabled={isSaving}
            className={`px-4 py-2 text-sm font-medium text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-300 hover:bg-${moduleConfig.baseColorClass}-100 dark:hover:bg-${moduleConfig.baseColorClass}-700/30 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${moduleConfig.baseColorClass}-400 transition-all duration-200 ease-in-out disabled:opacity-70`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={`min-w-[130px] px-6 py-2 text-sm font-medium text-white bg-${moduleConfig.baseColorClass}-600 hover:bg-${moduleConfig.baseColorClass}-700 dark:bg-${moduleConfig.baseColorClass}-500 dark:hover:bg-${moduleConfig.baseColorClass}-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-${moduleConfig.baseColorClass}-500 transition-all duration-200 ease-in-out disabled:opacity-70 flex items-center justify-center`}
          >
            {isSaving ? <LoadingSpinner size="sm" color="text-white" /> : 'Save Fertilizer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewFertilizerModal;
