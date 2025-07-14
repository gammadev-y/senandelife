
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
  
  const selectedItemClasses = `ring-2 ring-[#6C8C61] bg-[#DCEFD6]`;
  const normalItemClasses = 'bg-white hover:shadow-xl hover:bg-[#E5E3DD]'; 


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
            className={`stock-icon-placeholder w-full h-full flex items-center justify-center bg-[#E5E3DD] ${fertilizer.data.imageUrl ? 'hidden' : 'flex'}`}
        >
          <BeakerIcon className={`w-16 h-16 text-[#6C8C61]`} />
        </div>
      </div>
      <div className="p-3 text-center w-full">
        <p className={`font-medium text-sm truncate ${isSelected ? `text-[#1D3117]` : 'text-[#2C2C2C]'}`}>{fertilizer.fertilizer_name}</p>
        <p className={`text-xs truncate ${isSelected ? `text-[#1D3117]/80` : 'text-[#A67C52]'}`}>
            {fertilizer.type} - {fertilizer.form}
        </p>
      </div>
    </li>
  );
};

export default FertilizerListItem;
