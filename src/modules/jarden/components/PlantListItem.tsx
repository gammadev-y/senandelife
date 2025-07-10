
import React from 'react';
import { PlantListItemData } from '../services/idbServiceTypes'; // Changed import
import PlantStockIcon from './icons/PlantStockIcon'; 

interface PlantListItemProps {
  plant: PlantListItemData; // Changed from Plant to PlantListItemData
  onSelectPlant: (plantId: string) => void;
  isSelected: boolean;
  moduleConfig: { 
    listItemSelectedBg: string;
    listItemSelectedText: string;
    listItemHoverBg: string;
    baseColorClass: string; 
  };
}

const PlantListItem: React.FC<PlantListItemProps> = ({ plant, onSelectPlant, isSelected, moduleConfig }) => {
  const commonName = plant.commonName || 'Unnamed Plant';
  const scientificName = plant.scientificName || 'No scientific name';
  
  const imageUrl = plant.imageUrl; // Use imageUrl from PlantListItemData
  const imagePosition = plant.imagePosY || 50; // Use imagePosY from PlantListItemData

  const selectedItemClasses = `ring-2 ring-${moduleConfig.baseColorClass}-500 dark:ring-${moduleConfig.baseColorClass}-400 bg-${moduleConfig.baseColorClass}-50 dark:bg-${moduleConfig.baseColorClass}-900/50`;
  const normalItemClasses = 'bg-white dark:bg-slate-800 hover:shadow-lg dark:hover:bg-slate-700/70';

  return (
    <li
      onClick={() => onSelectPlant(plant.id)}
      className={`flex flex-col rounded-xl cursor-pointer transition-all duration-200 ease-in-out ripple shadow-md active:scale-[0.97] overflow-hidden ${isSelected ? selectedItemClasses : normalItemClasses}`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectPlant(plant.id)}
    >
      <div className="aspect-video w-full relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={commonName} 
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
          className={`stock-icon-placeholder w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 ${imageUrl ? 'hidden' : 'flex'}`}
        >
          <PlantStockIcon className={`w-16 h-16 text-${moduleConfig.baseColorClass}-400 dark:text-${moduleConfig.baseColorClass}-500`} />
        </div>
      </div>

      <div className="p-3 text-center w-full">
        <p className={`font-medium text-sm truncate ${isSelected ? `text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-200` : 'text-slate-800 dark:text-slate-100'}`}>{commonName}</p>
        <p className={`text-xs truncate ${isSelected ? `text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-300` : 'text-slate-500 dark:text-slate-400'}`}>
            <em>{scientificName}</em>
        </p>
      </div>
    </li>
  );
};

export default PlantListItem;