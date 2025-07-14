

import React, { useState, useRef, useEffect } from 'react';
import { GrowingGroundPlant, Plant, PlantStage } from '../types';
import { PLANT_STAGES, MODULES } from '../constants';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';

interface UpdatePlantStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plantId: string, data: { newStage: PlantStage, comment?: string, photoBase64?: string | null }) => void;
  plantInGround: GrowingGroundPlant;
  plantInfo: Plant;
  moduleConfig: typeof MODULES[0];
}

const UpdatePlantStageModal: React.FC<UpdatePlantStageModalProps> = ({
  isOpen, onClose, onSave, plantInGround, plantInfo, moduleConfig
}) => {
  const lastStage = plantInGround.stageLog?.[plantInGround.stageLog.length - 1]?.stage || 'Planning';
  const [stage, setStage] = useState<PlantStage>(lastStage);
  const [comment, setComment] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const currentLastStage = plantInGround.stageLog?.[plantInGround.stageLog.length - 1]?.stage || 'Planning';
      setStage(currentLastStage);
      setComment('');
      setPhotoBase64(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen, plantInGround]);

  if (!isOpen) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setError(null);
        const compressedFile = await compressFileBeforeUpload(file);
        const base64 = await convertFileToBase64(compressedFile);
        setPhotoBase64(base64);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process image.');
      }
    }
  };
  
  const handleSubmit = () => {
    onSave(plantInGround.plantId, { newStage: stage, comment: comment.trim() || undefined, photoBase64 });
    onClose();
  };
  
  const inputBaseClass = "w-full px-3 py-2.5 border border-[#B6B6B6] rounded-lg shadow-sm focus:outline-none sm:text-sm bg-white text-[#2C2C2C] placeholder-[#A67C52]";
  const inputFocusClass = `focus:ring-1 focus:ring-[#6C8C61] focus:border-[#6C8C61]`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col border border-[#E5E3DD]">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-[#1D3117]">Update Stage for {plantInfo.plant_identification_overview.common_names[0]}</h2>
          <button type="button" onClick={onClose} className="p-1.5 text-[#A67C52] hover:bg-[#E5E3DD] rounded-full" aria-label="Close modal">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3 p-2 bg-red-100 rounded-lg">{error}</p>}

        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label htmlFor="plantStage" className="block text-xs font-medium text-[#A67C52] mb-1">New Stage</label>
            <select
              id="plantStage"
              value={stage}
              onChange={(e) => setStage(e.target.value as PlantStage)}
              className={`${inputBaseClass} ${inputFocusClass} appearance-none`}
            >
              {PLANT_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="stageComment" className="block text-xs font-medium text-[#A67C52] mb-1">Comment (optional)</label>
            <textarea
              id="stageComment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="e.g., First true leaves have appeared."
              className={`${inputBaseClass} ${inputFocusClass} leading-relaxed`}
            />
             <p className="text-xs text-[#A67C52] mt-1">This comment will be added to the activity log.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A67C52] mb-1">Photo (optional)</label>
            <div className="mt-1 flex items-center space-x-3 p-3 bg-[#f0f0f0] rounded-lg">
                {photoBase64 ? (
                    <img src={photoBase64} alt="Preview" className="w-16 h-16 rounded-lg object-cover shadow-sm"/>
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-[#E5E3DD] flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-[#A67C52]"/>
                    </div>
                )}
                <div>
                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" id={`plant-stage-photo-upload`}/>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className={`flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#6C8C61] hover:bg-[#5a7850] rounded-full shadow-sm`}>
                        <ArrowUpTrayIcon className="w-3.5 h-3.5 mr-1" />
                        {photoBase64 ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {photoBase64 && (
                         <button type="button" onClick={() => { setPhotoBase64(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="mt-1.5 px-3 py-1.5 text-xs font-medium text-[#2C2C2C] hover:bg-[#E5E3DD] rounded-full">
                            Remove
                         </button>
                    )}
                </div>
            </div>
             <p className="text-xs text-[#A67C52] mt-1">This photo will be added to the activity log.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A67C52] mb-1">Stage History</label>
            <ul className="mt-1 space-y-1.5 max-h-32 overflow-y-auto border border-[#B6B6B6] rounded-lg p-2.5 bg-white">
              {plantInGround.stageLog.length > 0 ? (
                [...plantInGround.stageLog].reverse().map((log, index) => (
                    <li key={index} className="text-sm text-[#2C2C2C]">
                        <span className={`font-semibold text-[#6C8C61]`}>{log.stage}</span> on {new Date(log.date + 'T00:00:00').toLocaleDateString()}
                    </li>
                ))
              ) : (
                <li className="text-sm text-[#A67C52] italic">No history yet.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-[#E5E3DD]">
          <button type="button" onClick={onClose} 
            className={`px-4 py-2 text-sm font-medium text-[#6C8C61] hover:bg-[#DCEFD6] rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#6C8C61]`}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} 
            className={`px-6 py-2 text-sm font-medium text-white bg-[#6C8C61] hover:bg-[#5a7850] rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#6C8C61]`}>
            Save Stage
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePlantStageModal;