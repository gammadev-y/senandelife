
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
  
  const focusRingClass = `focus:ring-${moduleConfig.baseColorClass}-500 dark:focus:ring-${moduleConfig.baseColorClass}-400`;
  const focusBorderClass = `focus:border-${moduleConfig.baseColorClass}-500 dark:focus:border-${moduleConfig.baseColorClass}-400`;
  const primaryButtonBgClass = `bg-${moduleConfig.baseColorClass}-600 hover:bg-${moduleConfig.baseColorClass}-700 dark:bg-${moduleConfig.baseColorClass}-500 dark:hover:bg-${moduleConfig.baseColorClass}-600`;
  const primaryButtonRingClass = `focus:ring-${moduleConfig.baseColorClass}-500`;

  const titleText = sectionKey 
    ? `Custom AI for ${plantName} - Section: ${sectionKey.replace(/_/g, ' ')}`
    : `Custom AI for ${plantName}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100 capitalize">
            {titleText}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</p>}

        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
            Enter detailed instructions. The AI will populate {sectionKey ? `the "${sectionKey.replace(/_/g, ' ')}"` : "the plant's profile"} based on your prompt and the standard data structure.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            E.g., "Focus on drought-tolerance, companion plants for aphids, arid climate uses, historical significance."
          </p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={10}
            className={`mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none ${focusRingClass} ${focusBorderClass} sm:text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 leading-relaxed`}
            placeholder={`Describe what information you want for ${plantName}${sectionKey ? ` in the ${sectionKey.replace(/_/g, ' ')} section` : ''}...`}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3 border-t pt-4 border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-300 hover:bg-${moduleConfig.baseColorClass}-100 dark:hover:bg-${moduleConfig.baseColorClass}-700/30 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${moduleConfig.baseColorClass}-400 disabled:opacity-60`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !customPrompt.trim()}
            className={`min-w-[180px] px-6 py-2 text-sm font-medium text-white ${primaryButtonBgClass} rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 ${primaryButtonRingClass} disabled:opacity-60 flex items-center justify-center`}
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
