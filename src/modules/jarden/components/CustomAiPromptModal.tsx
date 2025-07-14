
import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import { MODULES } from '../constants';
import { PlantSectionKeyForAI } from '../types';

interface CustomAiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePrompt: (prompt: string) => Promise<void>; 
  plantName: string;
  isLoading: boolean;
  moduleConfig: typeof MODULES[0];
  sectionKey?: PlantSectionKeyForAI; // Optional section key
}

const CustomAiPromptModal: React.FC<CustomAiPromptModalProps> = ({ 
  isOpen, onClose, onExecutePrompt, plantName, isLoading, moduleConfig, sectionKey 
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!customPrompt.trim()) {
      setError("Prompt cannot be empty.");
      return;
    }
    setError(null);
    try {
      await onExecutePrompt(customPrompt);
      // Do not close modal here, let App.tsx handle it on successful execution
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while executing the prompt.");
    }
  };

  const handleClose = () => {
    setCustomPrompt('');
    setError(null);
    onClose();
  }
  
  const focusRingClass = `focus:ring-[#6C8C61]`;
  const focusBorderClass = `focus:border-[#6C8C61]`;
  const primaryButtonBgClass = `bg-[#6C8C61] hover:bg-[#5a7850]`;
  const primaryButtonRingClass = `focus:ring-[#6C8C61]`;

  const titleText = sectionKey 
    ? `Custom AI for ${plantName} - Section: ${sectionKey.replace(/_/g, ' ')}`
    : `Custom AI for ${plantName}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xl transform transition-all max-h-[90vh] flex flex-col border border-[#E5E3DD]">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-[#1D3117] capitalize">
            {titleText}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#A67C52] hover:bg-[#E5E3DD] rounded-full"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3 p-2 bg-red-100 rounded-lg">{error}</p>}

        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          <p className="text-sm text-[#2C2C2C] mb-1">
            Enter detailed instructions. The AI will populate {sectionKey ? `the "${sectionKey.replace(/_/g, ' ')}"` : "the plant's profile"} based on your prompt and the standard data structure.
          </p>
          <p className="text-xs text-[#A67C52] mb-3">
            E.g., "Focus on drought-tolerance, companion plants for aphids, arid climate uses, historical significance."
          </p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={10}
            className={`mt-1 block w-full px-3 py-2.5 border border-[#B6B6B6] rounded-lg shadow-sm focus:outline-none ${focusRingClass} ${focusBorderClass} sm:text-sm bg-[#FDFCF9] text-[#2C2C2C] placeholder-[#A67C52] leading-relaxed`}
            placeholder={`Describe what information you want for ${plantName}${sectionKey ? ` in the ${sectionKey.replace(/_/g, ' ')} section` : ''}...`}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3 border-t pt-4 border-[#E5E3DD]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-[#6C8C61] hover:bg-[#DCEFD6] rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#6C8C61] disabled:opacity-60`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !customPrompt.trim()}
            className={`min-w-[180px] px-6 py-2 text-sm font-medium text-white ${primaryButtonBgClass} rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${primaryButtonRingClass} disabled:opacity-60 flex items-center justify-center`}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color={`text-white`} />
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Execute Prompt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAiPromptModal;
