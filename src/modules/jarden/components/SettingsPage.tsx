
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import DefineLocationModal from './DefineLocationModal';
import { WeatherLocationPreference } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { SunIcon, MoonIcon, ComputerDesktopIcon, CogIcon } from '@heroicons/react/24/outline';

interface SettingsPageProps {
  // onWeatherPreferenceSelect is managed by AuthContext now through updateProfileData
  // No longer needed as direct prop if settings page uses updateProfileData for weather too.
  // However, App.tsx passes it, so let's keep it for now for consistency with current App.tsx structure,
  // but ideally, SettingsPage would use updateProfileData from context for weather as well.
  onWeatherPreferenceSelect: (preference: WeatherLocationPreference) => void;
}

type ThemeSetting = 'light' | 'dark' | 'system';

const SettingsPage: React.FC<SettingsPageProps> = ({ onWeatherPreferenceSelect }) => {
  const { user, profile, updateProfileData, loading: authLoading } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<ThemeSetting>('system');
  const [isDefineLocationModalOpen, setIsDefineLocationModalOpen] = useState(false);
  
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false); // For potential future direct save

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.preferences?.theme) {
      setCurrentTheme(profile.preferences.theme);
    }
  }, [profile?.preferences?.theme]);

  const handleThemeChange = async (theme: ThemeSetting) => {
    if (!profile) return;
    setCurrentTheme(theme);
    setIsLoadingTheme(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateProfileData({ preferences: { ...profile.preferences, theme } });
      setSuccessMessage("Theme preference updated!");
      // Visual theme update is handled by AuthContext effect reacting to profile change
    } catch (err: any) {
      setError(err.message || "Failed to save theme preference.");
    } finally {
      setIsLoadingTheme(false);
    }
  };

  const handleWeatherPrefSelectInternal = async (preference: WeatherLocationPreference) => {
    if (!profile) return;
    setIsLoadingWeather(true); // Indicate loading for weather update
    setError(null);
    setSuccessMessage(null);
    try {
      // Use the passed onWeatherPreferenceSelect from App.tsx which handles profile update
      onWeatherPreferenceSelect(preference);
      // If we wanted SettingsPage to be self-contained for weather:
      // await updateProfileData({ preferences: { ...profile.preferences, weather: preference }});
      setSuccessMessage("Weather preference updated!");
    } catch (err: any) {
      setError(err.message || "Failed to save weather preference.");
    } finally {
      setIsDefineLocationModalOpen(false);
      setIsLoadingWeather(false);
    }
  };
  
  const themeButtonClass = (theme: ThemeSetting) => 
    `flex-1 flex flex-col items-center p-3 rounded-lg border-2 transition-colors duration-150
     ${currentTheme === theme 
        ? 'bg-emerald-100 dark:bg-emerald-800 border-emerald-500 dark:border-emerald-400 shadow-md' 
        : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500'}`;
  
  const themeIconClass = (theme: ThemeSetting) =>
    `w-6 h-6 mb-1.5 ${currentTheme === theme ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`;


  if (authLoading || !profile) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg"/></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 text-slate-800 dark:text-slate-100">
      <h1 className="text-3xl font-bold text-center">Settings</h1>

      {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-sm text-center animate-pulse">{error}</p>}
      {successMessage && <p className="text-green-600 bg-green-50 dark:bg-green-900/30 p-3 rounded-md text-sm text-center animate-pulse">{successMessage}</p>}
      {(isLoadingTheme || isLoadingWeather) && <div className="flex justify-center my-2"><LoadingSpinner/></div>}

      {/* Theme Settings */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Appearance Theme</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => handleThemeChange('light')} className={themeButtonClass('light')} disabled={isLoadingTheme}>
            <SunIcon className={themeIconClass('light')} />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button onClick={() => handleThemeChange('dark')} className={themeButtonClass('dark')} disabled={isLoadingTheme}>
            <MoonIcon className={themeIconClass('dark')} />
            <span className="text-sm font-medium">Dark</span>
          </button>
          <button onClick={() => handleThemeChange('system')} className={themeButtonClass('system')} disabled={isLoadingTheme}>
            <ComputerDesktopIcon className={themeIconClass('system')} />
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </div>

      {/* Weather Settings */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Weather Location</h2>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>Current preference: 
            <span className="font-medium ml-1">
              {profile.preferences?.weather?.type === 'geolocation' ? 'Using Current Location' :
               profile.preferences?.weather?.type === 'manual' && profile.preferences.weather.location ? `Manually set to ${profile.preferences.weather.location.name}` :
               profile.preferences?.weather?.type === 'disabled' ? 'Weather Disabled' : 'Not Set'}
            </span>
          </p>
          <button 
            onClick={() => setIsDefineLocationModalOpen(true)}
            disabled={isLoadingWeather}
            className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 flex items-center disabled:opacity-70"
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
