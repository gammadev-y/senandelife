
import React from 'react';
import { GrowingGround } from '../types';
import { MapPinIcon } from '@heroicons/react/24/outline'; 

interface GrowingGroundListItemProps {
  ground: GrowingGround;
  onSelectGround: (groundId: string) => void;
  isSelected: boolean;
  moduleConfig: {
    listItemSelectedBg: string;
    listItemSelectedText: string;
    listItemHoverBg: string;
    baseColorClass: string;
  };
}

const GrowingGroundListItem: React.FC<GrowingGroundListItemProps> = ({ ground, onSelectGround, isSelected, moduleConfig }) => {
  const imagePosition = ground.image_object_position_y || 50;
  
  const selectedItemClasses = `ring-2 ring-[#6C8C61] bg-[#DCEFD6]`;
  const normalItemClasses = 'bg-white hover:shadow-xl hover:bg-[#E5E3DD]';

  return (
    <li
      onClick={() => onSelectGround(ground.id)}
      className={`flex flex-col rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ripple shadow-md active:scale-[0.97] overflow-hidden ${isSelected ? selectedItemClasses : normalItemClasses}`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectGround(ground.id)}
    >
      <div className="aspect-video w-full relative">
        {ground.imageUrl ? (
          <img 
              src={ground.imageUrl} 
              alt={ground.name} 
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
            className={`stock-icon-placeholder w-full h-full flex items-center justify-center bg-[#E5E3DD] ${ground.imageUrl ? 'hidden' : 'flex'}`}
        >
          <MapPinIcon className={`w-16 h-16 text-[#6C8C61]`} />
        </div>
      </div>
      <div className="p-3 text-center w-full">
        <p className={`font-medium text-sm truncate ${isSelected ? `text-[#1D3117]` : 'text-[#2C2C2C]'}`}>{ground.name}</p>
        <p className={`text-xs truncate ${isSelected ? `text-[#1D3117]/80` : 'text-[#A67C52]'}`}>
            {ground.type} - {ground.areaDimensions || 'N/A'}
        </p>
      </div>
    </li>
  );
};

export default GrowingGroundListItem;
