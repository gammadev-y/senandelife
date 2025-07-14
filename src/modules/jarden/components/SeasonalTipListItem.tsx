
import React from 'react';
import { SeasonalTipListItemData } from '../services/idbServiceTypes'; 
import LightBulbIcon from './icons/LightBulbIcon';

interface SeasonalTipListItemProps {
  tip: SeasonalTipListItemData; 
  onSelectTip: (tipId: string) => void;
  isSelected: boolean;
  moduleConfig: { 
    listItemSelectedBg: string;
    listItemSelectedText: string;
    listItemHoverBg: string;
    baseColorClass: string; 
  };
}

const SeasonalTipListItem: React.FC<SeasonalTipListItemProps> = ({ tip, onSelectTip, isSelected, moduleConfig }) => {
  const imageUrl = tip.imageUrl; 
  const imagePosition = tip.imagePosY || 50; 
  
  const selectedItemClasses = `ring-2 ring-[#6C8C61] bg-[#DCEFD6]`;
  const normalItemClasses = 'bg-white hover:shadow-xl hover:bg-[#E5E3DD]';

  return (
    <li
      onClick={() => onSelectTip(tip.id)}
      className={`flex flex-col rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ripple shadow-md active:scale-[0.97] overflow-hidden ${isSelected ? selectedItemClasses : normalItemClasses}`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectTip(tip.id)}
    >
      <div className="aspect-video w-full relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={tip.title} 
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
          className={`stock-icon-placeholder w-full h-full flex items-center justify-center bg-[#E5E3DD] ${imageUrl ? 'hidden' : 'flex'}`}
        >
          <LightBulbIcon className={`w-16 h-16 text-[#6C8C61]`} />
        </div>
      </div>

      <div className="p-3 text-center w-full">
        <p className={`font-medium text-sm truncate ${isSelected ? `text-[#1D3117]` : 'text-[#2C2C2C]'}`} title={tip.title}>
            {tip.title}
        </p>
        <p className={`text-xs truncate ${isSelected ? `text-[#1D3117]/80` : 'text-[#A67C52]'}`} title={tip.description || undefined}>
            {tip.description || (tip.tags && tip.tags.length > 0 ? tip.tags.join(', ') : 'Seasonal Advice')}
        </p>
      </div>
    </li>
  );
};

export default SeasonalTipListItem;
