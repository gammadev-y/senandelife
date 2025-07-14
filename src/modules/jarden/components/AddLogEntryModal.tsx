


import React, { useState, useRef } from 'react';
import { GroundLogEntry, GroundLogActionType } from '../types';
import { GROUND_LOG_ACTION_TYPES, MODULES } from '../constants';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';

interface AddLogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logEntry: Omit<GroundLogEntry, 'id'>) => void;
  groundId: string; 
  moduleConfig: typeof MODULES[0];
}

const MAX_PHOTOS = 3;

const AddLogEntryModal: React.FC<AddLogEntryModalProps> = ({ isOpen, onClose, onSave, groundId, moduleConfig }) => {
  const [actionType, setActionType] = useState<GroundLogActionType>(GROUND_LOG_ACTION_TYPES[0]);
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16)); 
  const [photoBase64s, setPhotoBase64s] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null));
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>(Array(MAX_PHOTOS).fill(null));

  if (!isOpen) return null;

  const handleFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const newPhotoBase64s = [...photoBase64s];
    if (file) {
      try {
        const compressedFile = await compressFileBeforeUpload(file);
        const base64 = await convertFileToBase64(compressedFile);
        newPhotoBase64s[index] = base64;
        setError(null); 
      } catch (err) {
        console.error("Error processing file:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load image. Please try another file.";
        setError(errorMessage);
        newPhotoBase64s[index] = null;
      }
    } else {
      newPhotoBase64s[index] = null; 
    }
    setPhotoBase64s(newPhotoBase64s);
  };
  
  const clearForm = () => {
    setActionType(GROUND_LOG_ACTION_TYPES[0]);
    setDescription('');
    setTimestamp(new Date().toISOString().slice(0, 16));
    setPhotoBase64s(Array(MAX_PHOTOS).fill(null));
    setError(null);
    fileInputRefs.current.forEach(input => {
        if (input) input.value = '';
    });
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      setError("Description is required for the log entry.");
      return;
    }
    setError(null);
    
    const finalPhotoUrls = photoBase64s.filter(base64 => base64 !== null) as string[];

    onSave({
      timestamp: new Date(timestamp).toISOString(), 
      actionType,
      description: description.trim(),
      photoUrls: finalPhotoUrls.length > 0 ? finalPhotoUrls : undefined,
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
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">Add Log Entry</h2>
          <button type="button" onClick={() => { clearForm(); onClose();}} className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" aria-label="Close modal">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</p>}

        <div className="space-y-5 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label htmlFor="logTimestamp" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              id="logTimestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className={`${inputBaseClass} ${inputFocusClass} rounded-lg`}
            />
          </div>

          <div>
            <label htmlFor="actionType" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Action Type</label>
            <select
              id="actionType"
              value={actionType}
              onChange={(e) => setActionType(e.target.value as GroundLogActionType)}
              className={`${inputBaseClass} ${inputFocusClass} rounded-lg appearance-none`}
            >
              {GROUND_LOG_ACTION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="logDescription" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="logDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${inputBaseClass} ${!description.trim() && error ? inputErrorClass : inputFocusClass} rounded-t-lg leading-relaxed`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Photos (up to {MAX_PHOTOS}, optional)</label>
            {Array.from({ length: MAX_PHOTOS }).map((_, index) => (
              <div key={index} className="mt-2 flex items-center space-x-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg mb-2">
                {photoBase64s[index] ? (
                    <img src={photoBase64s[index]!} alt={`Preview ${index + 1}`} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      <PhotoIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                )}
                <div className="flex flex-col space-y-1.5">
                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(index, e)}
                    ref={(el: HTMLInputElement | null) => { fileInputRefs.current[index] = el; }}
                    className="hidden"
                    id={`logPhotoUploadModal-${index}`}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className={`px-3 py-1.5 text-xs font-medium text-${moduleConfig.baseColorClass}-700 bg-${moduleConfig.baseColorClass}-100 hover:bg-${moduleConfig.baseColorClass}-200 dark:text-${moduleConfig.baseColorClass}-200 dark:bg-${moduleConfig.baseColorClass}-700 dark:hover:bg-${moduleConfig.baseColorClass}-600 rounded-full shadow-sm flex items-center`}
                    >
                        <ArrowUpTrayIcon className="w-3.5 h-3.5 mr-1" />
                        {photoBase64s[index] ? 'Change' : 'Upload'}
                    </button>
                    {photoBase64s[index] && (
                        <button
                        type="button"
                        onClick={() => {
                            const newPhotos = [...photoBase64s];
                            newPhotos[index] = null;
                            setPhotoBase64s(newPhotos);
                            if(fileInputRefs.current[index]) fileInputRefs.current[index]!.value = '';
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"
                        >
                         Remove
                        </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => { clearForm(); onClose(); }}
            className={`px-4 py-2 text-sm font-medium text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-300 hover:bg-${moduleConfig.baseColorClass}-100 dark:hover:bg-${moduleConfig.baseColorClass}-700/30 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${moduleConfig.baseColorClass}-400`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-6 py-2 text-sm font-medium text-white bg-${moduleConfig.baseColorClass}-600 hover:bg-${moduleConfig.baseColorClass}-700 dark:bg-${moduleConfig.baseColorClass}-500 dark:hover:bg-${moduleConfig.baseColorClass}-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-${moduleConfig.baseColorClass}-500`}
          >
            Save Log Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLogEntryModal;