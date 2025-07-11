
import React from 'react';
import { Fertilizer } from '../types';
import { BeakerIcon } from '@heroicons/react/24/outline';

interface FertilizerListItemProps {
  fertilizer: Fertilizer;
  onSelectFertilizer: (fertilizerId: string) => void;
  isSelected: boolean;
  moduleConfig: {
    listItemSelectedBg: string; // Not directly used, ring takes precedence
    listItemSelectedText: string; // Not directly used
    listItemHoverBg: string;
    baseColorClass: string;
  };
}

const FertilizerListItem: React.FC<FertilizerListItemProps> = ({ fertilizer, onSelectFertilizer, isSelected, moduleConfig }) => {
  const imagePosition = fertilizer.data.image_object_position_y || 50;
  
  const selectedItemClasses = `ring-2 ring-${moduleConfig.baseColorClass}-500 dark:ring-${moduleConfig.baseColorClass}-400 bg-${moduleConfig.baseColorClass}-50 dark:bg-${moduleConfig.baseColorClass}-900/50`;
  const normalItemClasses = 'bg-white dark:bg-slate-800 hover:shadow-xl dark:hover:bg-slate-700/70'; // Changed neutral to slate


  return (
    <li
      onClick={() => onSelectFertilizer(fertilizer.id)}
      className={`flex flex-col rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ripple shadow-md active:scale-[0.97] overflow-hidden ${isSelected ? selectedItemClasses : normalItemClasses}`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectFertilizer(fertilizer.id)}
    >
      <div className="aspect-video w-full relative">
        {fertilizer.data.imageUrl ? (
          <img 
              src={fertilizer.data.imageUrl} 
              alt={fertilizer.fertilizer_name} 
              className="w-full h-full object-cover"
              style={{ objectPosition: `50% ${imagePosition}%` }}
              onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentNode;
                  if (parent) {
                      const placeholder = parent.querySelector('.stock-icon-placeholder');
                      if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                  }
              }}
          />
        ) : null}
        <div 
            className={`stock-icon-placeholder w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 ${fertilizer.data.imageUrl ? 'hidden' : 'flex'}`} // Changed neutral to slate
        >
          <BeakerIcon className={`w-16 h-16 text-${moduleConfig.baseColorClass}-400 dark:text-${moduleConfig.baseColorClass}-500`} />
        </div>
      </div>
      <div className="p-3 text-center w-full">
        <p className={`font-medium text-sm truncate ${isSelected ? `text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-200` : 'text-slate-800 dark:text-slate-100'}`}>{fertilizer.fertilizer_name}</p> {/* Changed neutral to slate */}
        <p className={`text-xs truncate ${isSelected ? `text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-300` : 'text-slate-500 dark:text-slate-400'}`}> {/* Changed neutral to slate */}
            {fertilizer.type} - {fertilizer.form}
        </p>
      </div>
    </li>
  );
};

export default FertilizerListItem;
