
import React, { useState, useEffect } from 'react';
import { WeatherLocationPreference, WeatherForecastData, DailyForecast } from '../types';
import { fetchWeatherForecast, getWeatherDescriptionAndIcon } from '../services/weatherService';
import LoadingSpinner from './LoadingSpinner';
import { 
    SunIcon as SolidSunIcon, 
    ExclamationTriangleIcon,
    CloudArrowDownIcon as CloudRainIconOutline, 
    CloudIcon as CloudIconOutline, 
    BoltIcon as BoltIconOutline, 
    QuestionMarkCircleIcon as QuestionMarkCircleIconOutline, 
    Bars3Icon as Bars3IconOutline, 
    CpuChipIcon as SnowflakeIconOutline,
    CogIcon,
    WifiIcon,
} from '@heroicons/react/24/outline';

interface WeatherBannerProps {
  weatherLocationPreference: WeatherLocationPreference | null;
  setIsDefineLocationModalOpen: (isOpen: boolean) => void;
}

const WeatherIconMap: Record<string, React.ElementType> = {
    SunIcon: SolidSunIcon,
    CloudIconOutline: CloudIconOutline,
    Bars3IconOutline: Bars3IconOutline,
    CloudArrowDownIconOutline: CloudRainIconOutline,
    SnowflakeIconOutline: SnowflakeIconOutline,
    BoltIconOutline: BoltIconOutline,
    QuestionMarkCircleIconOutline: QuestionMarkCircleIconOutline,
};

const getTemperatureColor = (temp: number): string => {
    if (temp < 5) return 'text-blue-500 dark:text-blue-400'; 
    if (temp < 12) return 'text-sky-500 dark:text-sky-400';    
    if (temp < 18) return 'text-slate-700 dark:text-slate-200'; 
    if (temp < 25) return 'text-yellow-500 dark:text-yellow-400'; 
    return 'text-orange-500 dark:text-orange-400'; 
};

const DayForecastCard: React.FC<{ forecast: DailyForecast; isToday: boolean }> = ({ forecast, isToday }) => {
  const { description, iconName } = getWeatherDescriptionAndIcon(forecast.weatherCode);
  const WeatherIcon = WeatherIconMap[iconName] || QuestionMarkCircleIconOutline;
  const date = new Date(forecast.date + 'T00:00:00');
  const dayName = isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' });
  const avgTemp = (forecast.minTemp + forecast.maxTemp) / 2;

  return (
    <div className="flex flex-col items-center p-2 bg-slate-100/60 dark:bg-slate-800/50 rounded-lg shadow-sm text-center min-w-[70px] md:min-w-[85px]">
      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{dayName}</p>
      <WeatherIcon className="w-5 h-5 md:w-6 md:h-6 my-1 text-slate-600 dark:text-slate-300" title={description}/>
      <p className={`text-sm font-semibold ${getTemperatureColor(avgTemp)}`}>
        {forecast.minTemp.toFixed(0)}°<span className="text-slate-500 dark:text-slate-400">-{forecast.maxTemp.toFixed(0)}°</span>
      </p>
      {(forecast.minHumidity !== undefined && forecast.maxHumidity !== undefined) && (
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
          <WifiIcon className="w-2.5 h-2.5 inline-block mr-0.5 -mt-0.5 text-sky-500" />
           {forecast.minHumidity}%-{forecast.maxHumidity}%
        </p>
      )}
    </div>
  );
};

const WEATHER_CACHE_KEY = 'jardenWeatherCache';
const CACHE_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours

interface CachedWeatherData {
    data: WeatherForecastData;
    timestamp: number;
    preferenceString: string; // Stringified preference for comparison
}

const WeatherBanner: React.FC<WeatherBannerProps> = ({ weatherLocationPreference, setIsDefineLocationModalOpen }) => {
  const [forecastData, setForecastData] = useState<WeatherForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!weatherLocationPreference || weatherLocationPreference.type === 'disabled') {
        setForecastData(null);
        setError(null);
        setIsLoading(false);
        setLocationName(null);
        return;
      }

      const currentPreferenceString = JSON.stringify(weatherLocationPreference);

      // Check cache first
      const cachedItem = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cachedItem) {
        try {
          const cached: CachedWeatherData = JSON.parse(cachedItem);
          const isCacheValid = 
            Date.now() - cached.timestamp < CACHE_EXPIRY_MS &&
            cached.preferenceString === currentPreferenceString;

          if (isCacheValid) {
            setForecastData(cached.data);
            setLocationName(weatherLocationPreference.type === 'manual' && weatherLocationPreference.location ? weatherLocationPreference.location.name : 'Your Location');
            setIsLoading(false);
            setError(null);
            return; 
          }
        } catch (e) {
          console.warn("Failed to parse weather cache, fetching new data.", e);
          localStorage.removeItem(WEATHER_CACHE_KEY);
        }
      }
      
      setIsLoading(true);
      setError(null);
      setLocationName(weatherLocationPreference.type === 'manual' && weatherLocationPreference.location ? weatherLocationPreference.location.name : 'Your Location');

      const saveToCache = (data: WeatherForecastData) => {
        const cacheEntry: CachedWeatherData = {
            data,
            timestamp: Date.now(),
            preferenceString: currentPreferenceString,
        };
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheEntry));
      };

      if (weatherLocationPreference.type === 'geolocation') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const data = await fetchWeatherForecast(position.coords.latitude, position.coords.longitude);
                setForecastData(data);
                saveToCache(data);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch weather.');
              } finally {
                setIsLoading(false);
              }
            },
            (geoError) => {
              console.error("Geolocation error:", geoError);
              setError('Geolocation failed. Please check permissions or set a location manually.');
              // REMOVED: setIsDefineLocationModalOpen(true);
              setIsLoading(false);
            },
            { timeout: 10000 }
          );
        } else {
          setError("Geolocation is not supported. Please choose a location manually.");
          // REMOVED: setIsDefineLocationModalOpen(true);
          setIsLoading(false);
        }
      } else if (weatherLocationPreference.type === 'manual' && weatherLocationPreference.location) {
        try {
          const data = await fetchWeatherForecast(weatherLocationPreference.location.latitude, weatherLocationPreference.location.longitude);
          setForecastData(data);
          saveToCache(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch weather for the selected location.');
        } finally {
          setIsLoading(false);
        }
      } else { 
         setError("Weather location not configured.");
         // REMOVED: setIsDefineLocationModalOpen(true);
         setIsLoading(false);
      }
    };

    fetchForecast();
  }, [weatherLocationPreference]); // Removed setIsDefineLocationModalOpen from dependencies as it's stable

  const handleOpenSettings = () => {
    setIsDefineLocationModalOpen(true);
  };
  
  if (!weatherLocationPreference || weatherLocationPreference.type === 'disabled' || weatherLocationPreference.type === null) {
    return null; 
  }

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg flex items-center justify-center h-24">
        <LoadingSpinner size="sm" color="text-slate-600 dark:text-slate-300"/> 
        <span className="ml-2 text-sm text-slate-700 dark:text-slate-200">Loading weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-lg text-center">
        <div className="flex items-center justify-center text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="w-5 h-5 mr-1.5"/>
            <p className="text-xs">{error}</p>
        </div>
        <button 
            onClick={handleOpenSettings}
            className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 hover:underline font-medium flex items-center justify-center mx-auto"
        >
           <CogIcon className="w-3.5 h-3.5 mr-1"/> Adjust Settings
        </button>
      </div>
    );
  }

  if (!forecastData || forecastData.daily.length === 0) {
    return (
        <div className="p-3 rounded-lg text-center">
            <p className="text-sm text-slate-700 dark:text-slate-200">No weather data available.</p>
             <button 
                onClick={handleOpenSettings}
                className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 hover:underline font-medium flex items-center justify-center mx-auto"
            >
               <CogIcon className="w-3.5 h-3.5 mr-1"/> Check Settings
            </button>
        </div>
    );
  }
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-1 md:p-2 rounded-lg">
      {locationName && (
        <div className="flex justify-between items-baseline mb-1.5 px-1">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={locationName}>
                Weather for {locationName}
            </h3>
             <button 
                onClick={handleOpenSettings}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Change weather settings"
                aria-label="Change weather settings"
            >
                <CogIcon className="w-4 h-4" />
            </button>
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 md:gap-2">
        {forecastData.daily.slice(0, 5).map((dayForecast) => (
          <DayForecastCard key={dayForecast.date} forecast={dayForecast} isToday={dayForecast.date === today} />
        ))}
      </div>
    </div>
  );
};

export default WeatherBanner;
