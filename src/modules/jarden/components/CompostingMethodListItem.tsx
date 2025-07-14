
import React from 'react';
import { CompostingMethod } from '../types';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

interface CompostingMethodListItemProps {
  method: CompostingMethod;
  onSelectMethod: (methodId: string) => void;
  isSelected: boolean;
  moduleConfig: {
    listItemSelectedBg: string; 
    listItemSelectedText: string; 
    listItemHoverBg: string;
    baseColorClass: string;
  };
}

const CompostingMethodListItem: React.FC<CompostingMethodListItemProps> = ({ method, onSelectMethod, isSelected, moduleConfig }) => {
  const imagePosition = method.data.image_object_position_y || 50;

  const selectedItemClasses = `ring-2 ring-[#6C8C61] bg-[#DCEFD6]`;
  const normalItemClasses = 'bg-white hover:shadow-xl hover:bg-[#E5E3DD]';
    
  return (
    <li
      onClick={() => onSelectMethod(method.id)}
      className={`flex flex-col rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ripple shadow-md active:scale-[0.97] overflow-hidden ${isSelected ? selectedItemClasses : normalItemClasses}`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectMethod(method.id)}
    >
      <div className="aspect-video w-full relative">
        {method.data.imageUrl ? (
          <img 
              src={method.data.imageUrl} 
              alt={method.method_name} 
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
        ) : null }
        <div 
            className={`stock-icon-placeholder w-full h-full flex items-center justify-center bg-[#E5E3DD] ${method.data.imageUrl ? 'hidden' : 'flex'}`}
        >
          <CubeTransparentIcon className={`w-16 h-16 text-[#6C8C61]`} />
        </div>
      </div>
      <div className="p-3 text-center w-full">
        <p className={`font-medium text-sm truncate ${isSelected ? `text-[#1D3117]` : 'text-[#2C2C2C]'}`}>{method.method_name}</p>
        <p className={`text-xs truncate ${isSelected ? `text-[#1D3117]/80` : 'text-[#A67C52]'}`}>
            {method.primary_composting_approach}
        </p>
      </div>
    </li>
  );
};

export default CompostingMethodListItem;
