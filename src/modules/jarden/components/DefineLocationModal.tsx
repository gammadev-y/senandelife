

import React, { useState, useEffect, useCallback } from 'react';
import { WeatherLocationPreference, SearchedLocation, WeatherLocationPreferenceType } from '../types';
import { searchLocations } from '../services/weatherService';
import { XMarkIcon, MapPinIcon, MagnifyingGlassIcon, EyeSlashIcon, CheckCircleIcon as SolidCheckCircleIcon, ArrowPathIcon as LoadingIcon } from '@heroicons/react/24/solid';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

interface DefineLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferenceSelect: (preference: WeatherLocationPreference) => void;
  currentPreference?: WeatherLocationPreference | null;
}

const DefineLocationModal: React.FC<DefineLocationModalProps> = ({ isOpen, onClose, onPreferenceSelect, currentPreference }) => {
  const [activeMode, setActiveMode] = useState<WeatherLocationPreferenceType | 'initial'>(currentPreference?.type || 'initial');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm && activeMode === 'manual') {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults([]);
      searchLocations(debouncedSearchTerm)
        .then(results => {
          setSearchResults(results);
          if (results.length === 0) {
            setSearchError('No locations found for your query.');
          }
        })
        .catch(err => {
          setSearchError(err.message || 'Failed to search locations.');
        })
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, activeMode]);
  
  useEffect(() => {
    if (isOpen) {
      setActiveMode(currentPreference?.type || 'initial');
      setSearchTerm(currentPreference?.type === 'manual' && currentPreference.location ? currentPreference.location.name : '');
      setSearchResults(currentPreference?.type === 'manual' && currentPreference.location ? [currentPreference.location] : []);
      setSearchError(null);
      setGeolocationError(null);
    }
  }, [isOpen, currentPreference]);


  const handleModeSelect = (mode: WeatherLocationPreferenceType) => {
    setActiveMode(mode);
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
    setGeolocationError(null);

    if (mode === 'geolocation') {
      onPreferenceSelect({ type: 'geolocation' });
      onClose();
    } else if (mode === 'disabled') {
      onPreferenceSelect({ type: 'disabled' });
      onClose();
    }
  };

  const handleLocationSelect = (location: SearchedLocation) => {
    onPreferenceSelect({ type: 'manual', location });
    onClose();
  };
  
  const baseButtonClass = "w-full flex flex-col items-center justify-center p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ease-in-out border-2";
  const activeClass = "border-[#6C8C61] bg-[#DCEFD6] ring-2 ring-[#6C8C61]";
  const inactiveClass = "border-[#E5E3DD] bg-white hover:border-[#B6B6B6]";
  const iconClass = "w-8 h-8 md:w-10 md:h-10 mb-2";


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-[#FDFCF9] p-5 md:p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col border border-[#E5E3DD]">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-[#1D3117]">Weather Location Preference</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A67C52] hover:bg-[#E5E3DD] rounded-full"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-1">
          {/* Geolocation Option */}
          <button
            className={`${baseButtonClass} ${activeMode === 'geolocation' ? activeClass : inactiveClass}`}
            onClick={() => handleModeSelect('geolocation')}
            aria-pressed={activeMode === 'geolocation'}
          >
            <MapPinIcon className={`${iconClass} ${activeMode === 'geolocation' ? 'text-[#6C8C61]' : 'text-[#A67C52]'}`} />
            <span className="text-sm font-medium text-[#2C2C2C]">Use My Current Location</span>
            <p className="text-xs text-[#A67C52] mt-1">Requires browser permission.</p>
          </button>
          {geolocationError && <p className="text-xs text-red-500 text-center">{geolocationError}</p>}


          {/* Manual Search Option */}
          <div
            className={`${baseButtonClass} ${activeMode === 'manual' ? activeClass : inactiveClass} items-stretch text-left`}
            role="group"
          >
             <button className="w-full flex flex-col items-center text-center" onClick={() => setActiveMode(activeMode === 'manual' ? 'initial' : 'manual')}>
                <BuildingOffice2Icon className={`${iconClass} ${activeMode === 'manual' ? 'text-[#6C8C61]' : 'text-[#A67C52]'}`} />
                <span className="text-sm font-medium text-[#2C2C2C]">Choose a Specific Location</span>
             </button>

            {activeMode === 'manual' && (
              <div className="mt-3 space-y-3 w-full">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A67C52]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search city or region..."
                    className="w-full pl-10 pr-3 py-2.5 border border-[#B6B6B6] rounded-lg bg-white text-[#2C2C2C] placeholder-[#A67C52] focus:ring-1 focus:ring-[#6C8C61] focus:border-[#6C8C61] outline-none text-sm"
                    aria-label="Search for a location"
                  />
                </div>
                {isSearching && <div className="flex justify-center py-2"><LoadingSpinner size="sm" /></div>}
                {searchError && <p className="text-xs text-red-500 text-center py-1">{searchError}</p>}
                {searchResults.length > 0 && !isSearching && (
                  <ul className="max-h-40 overflow-y-auto space-y-1 border border-[#E5E3DD] rounded-md p-1 bg-white">
                    {searchResults.map(location => (
                      <li key={location.id}>
                        <button
                          onClick={() => handleLocationSelect(location)}
                          className="w-full text-left p-2 rounded-md hover:bg-[#DCEFD6] text-sm text-[#2C2C2C] transition-colors"
                          aria-label={`Select ${location.name}${location.admin1 ? `, ${location.admin1}` : ''}${location.country ? `, ${location.country}` : ''}`}
                        >
                          {location.name}
                          {(location.admin1 || location.country) && (
                            <span className="text-xs text-[#A67C52]">
                              {location.admin1 && ` (${location.admin1}${location.country ? ', ' : ''}`}
                              {location.country && `${location.country}`}
                              {location.admin1 && `)`}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          {/* Disable Weather Option */}
          <button
            className={`${baseButtonClass} ${activeMode === 'disabled' ? activeClass : inactiveClass}`}
            onClick={() => handleModeSelect('disabled')}
            aria-pressed={activeMode === 'disabled'}
          >
            <EyeSlashIcon className={`${iconClass} ${activeMode === 'disabled' ? 'text-[#6C8C61]' : 'text-[#A67C52]'}`} />
            <span className="text-sm font-medium text-[#2C2C2C]">Don't Show Weather</span>
            <p className="text-xs text-[#A67C52] mt-1">Hide the weather display.</p>
          </button>
        </div>

         <div className="mt-5 md:mt-6 pt-4 border-t border-[#E5E3DD] flex justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[#2C2C2C] bg-[#E5E3DD] hover:bg-[#DCEFD6] rounded-lg shadow-sm transition-colors"
            >
                Cancel
            </button>
         </div>
      </div>
    </div>
  );
};

export default DefineLocationModal;