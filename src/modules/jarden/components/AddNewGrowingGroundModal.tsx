
import React, { useState, useRef } from 'react';
import { GrowingGroundInput, GrowingGround } from '../types';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';
import { MODULES, GROUND_TYPES } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface AddNewGrowingGroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groundInput: GrowingGroundInput) => Promise<any>;
  moduleConfig: typeof MODULES[0];
}

const AddNewGrowingGroundModal: React.FC<AddNewGrowingGroundModalProps> = ({ isOpen, onClose, onSave, moduleConfig }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<GrowingGround['type']>(GROUND_TYPES[0]);
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
    setType(GROUND_TYPES[0]);
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
      setError("Ground name is required.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type: type,
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

  const inputBaseClass = "w-full px-3 py-2.5 border-0 border-b-2 bg-[#E5E3DD] text-[#2C2C2C] placeholder-[#A67C52] focus:outline-none sm:text-sm transition-colors";
  const inputFocusClass = "focus:border-[#6C8C61] focus:ring-0 focus:bg-[#DCEFD6]";
  const inputErrorClass = "border-red-500";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col border border-[#E5E3DD]">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-[#1D3117]">Add New Growing Ground</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#A67C52] hover:bg-[#E5E3DD] rounded-full transition-colors duration-200 ease-in-out"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3 p-2 bg-red-100 rounded-lg">{error}</p>}

        <div className="space-y-5 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label htmlFor="groundName" className="block text-xs font-medium text-[#A67C52] mb-1">
              Ground Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="groundName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputBaseClass} ${name.trim() || !error ? inputFocusClass : inputErrorClass} rounded-t-lg`}
              required
            />
          </div>
          <div>
            <label htmlFor="groundType" className="block text-xs font-medium text-[#A67C52] mb-1">Type</label>
            <select id="groundType" value={type} onChange={(e) => setType(e.target.value as GrowingGround['type'])} className={`${inputBaseClass} ${inputFocusClass} rounded-lg appearance-none`}>
                {GROUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-[#A67C52] mb-1">Ground Image</label>
            <div className="mt-1 flex items-center space-x-4 p-3 bg-[#f0f0f0] rounded-lg">
              {imageBase64 ? (
                <img src={imageBase64} alt="Preview" className="w-20 h-20 rounded-lg object-cover shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-[#E5E3DD] flex items-center justify-center">
                  <PhotoIcon className="w-10 h-10 text-[#A67C52]" />
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="groundImageUploadModal"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-3 py-1.5 text-xs font-medium text-white bg-[#6C8C61] hover:bg-[#5a7850] rounded-full shadow-sm flex items-center transition-all duration-200 ease-in-out`}
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
                        className="px-3 py-1.5 text-xs font-medium text-[#2C2C2C] hover:bg-[#E5E3DD] rounded-full transition-all duration-200 ease-in-out"
                    >
                        Remove
                    </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="groundDescription" className="block text-xs font-medium text-[#A67C52] mb-1">
              Description
            </label>
            <textarea
              id="groundDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputBaseClass} ${inputFocusClass} rounded-t-lg leading-relaxed`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-[#E5E3DD]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className={`px-4 py-2 text-sm font-medium text-[#6C8C61] hover:bg-[#DCEFD6] rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#6C8C61] transition-all duration-200 ease-in-out disabled:opacity-70`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={`min-w-[120px] px-6 py-2 text-sm font-medium text-white bg-[#6C8C61] hover:bg-[#5a7850] rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#6C8C61] transition-all duration-200 ease-in-out disabled:opacity-70 flex items-center justify-center`}
          >
            {isSaving ? <LoadingSpinner size="sm" color="text-white" /> : 'Save Ground'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewGrowingGroundModal;
