

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import DefineLocationModal from './DefineLocationModal';
import { WeatherLocationPreference } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { CogIcon } from '@heroicons/react/24/outline';

interface SettingsPageProps {
  onWeatherPreferenceSelect: (preference: WeatherLocationPreference) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onWeatherPreferenceSelect }) => {
  const { user, profile, updateProfileData, loading: authLoading } = useAuth();
  const [isDefineLocationModalOpen, setIsDefineLocationModalOpen] = useState(false);
  
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleWeatherPrefSelectInternal = async (preference: WeatherLocationPreference) => {
    if (!profile) return;
    setIsLoadingWeather(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateProfileData({ preferences: { ...profile.preferences, weather: preference } });
      setSuccessMessage("Weather preference updated!");
    } catch (err: any) {
      setError(err.message || "Failed to save weather preference.");
    } finally {
      setIsDefineLocationModalOpen(false);
      setIsLoadingWeather(false);
    }
  };
  
  if (authLoading || !profile) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg"/></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 text-[#2C2C2C]">
      <h1 className="text-3xl font-bold text-center">Settings</h1>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm text-center animate-pulse">{error}</p>}
      {successMessage && <p className="text-green-600 bg-green-50 p-3 rounded-lg text-sm text-center animate-pulse">{successMessage}</p>}
      {isLoadingWeather && <div className="flex justify-center my-2"><LoadingSpinner/></div>}

      {/* Weather Settings */}
      <div className="p-6 bg-white rounded-2xl shadow-lg border border-[#E5E3DD]">
        <h2 className="text-xl font-semibold text-[#1D3117] mb-4">Weather Location</h2>
        <div className="space-y-2 text-sm text-[#2C2C2C]">
          <p>Current preference: 
            <span className="font-medium ml-1 text-[#A67C52]">
              {profile.preferences?.weather?.type === 'geolocation' ? 'Using Current Location' :
               profile.preferences?.weather?.type === 'manual' && profile.preferences.weather.location ? `Manually set to ${profile.preferences.weather.location.name}` :
               profile.preferences?.weather?.type === 'disabled' ? 'Weather Disabled' : 'Not Set'}
            </span>
          </p>
          <button 
            onClick={() => setIsDefineLocationModalOpen(true)}
            disabled={isLoadingWeather}
            className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C8C61] text-white bg-[#6C8C61] hover:bg-[#5a7850] flex items-center disabled:opacity-70"
          >
           {isLoadingWeather ? <LoadingSpinner size="sm" color="text-white"/> : <CogIcon className="w-5 h-5 mr-2"/>}
           Change Weather Settings
          </button>
        </div>
      </div>

      <DefineLocationModal
        isOpen={isDefineLocationModalOpen}
        onClose={() => setIsDefineLocationModalOpen(false)}
        onPreferenceSelect={handleWeatherPrefSelectInternal}
        currentPreference={profile.preferences?.weather}
      />
    </div>
  );
};

export default SettingsPage;
