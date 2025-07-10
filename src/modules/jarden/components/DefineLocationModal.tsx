
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
  const activeClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-500"; // Using emerald as primary M3 color
  const inactiveClass = "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500";
  const iconClass = "w-8 h-8 md:w-10 md:h-10 mb-2";


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-slate-100 dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Weather Location Preference</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
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
            <MapPinIcon className={`${iconClass} ${activeMode === 'geolocation' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Use My Current Location</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Requires browser permission.</p>
          </button>
          {geolocationError && <p className="text-xs text-red-500 text-center">{geolocationError}</p>}


          {/* Manual Search Option */}
          <div
            className={`${baseButtonClass} ${activeMode === 'manual' ? activeClass : inactiveClass} items-stretch text-left`}
            role="group"
          >
             <button className="w-full flex flex-col items-center text-center" onClick={() => setActiveMode(activeMode === 'manual' ? 'initial' : 'manual')}>
                <BuildingOffice2Icon className={`${iconClass} ${activeMode === 'manual' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Choose a Specific Location</span>
             </button>

            {activeMode === 'manual' && (
              <div className="mt-3 space-y-3 w-full">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search city or region..."
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                    aria-label="Search for a location"
                  />
                </div>
                {isSearching && <div className="flex justify-center py-2"><LoadingSpinner size="sm" /></div>}
                {searchError && <p className="text-xs text-red-500 dark:text-red-400 text-center py-1">{searchError}</p>}
                {searchResults.length > 0 && !isSearching && (
                  <ul className="max-h-40 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-700 rounded-md p-1 bg-slate-50 dark:bg-slate-700/50">
                    {searchResults.map(location => (
                      <li key={location.id}>
                        <button
                          onClick={() => handleLocationSelect(location)}
                          className="w-full text-left p-2 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-700/70 text-sm text-slate-700 dark:text-slate-200 transition-colors"
                          aria-label={`Select ${location.name}${location.admin1 ? `, ${location.admin1}` : ''}${location.country ? `, ${location.country}` : ''}`}
                        >
                          {location.name}
                          {(location.admin1 || location.country) && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
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
            <EyeSlashIcon className={`${iconClass} ${activeMode === 'disabled' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Don't Show Weather</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hide the weather display.</p>
          </button>
        </div>

         <div className="mt-5 md:mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg shadow-sm transition-colors"
            >
                Cancel
            </button>
         </div>
      </div>
    </div>
  );
};

export default DefineLocationModal;
