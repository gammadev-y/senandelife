import { WeatherForecastData, WeatherCodeMapping, SearchedLocation, DailyForecast } from '../types'; 

const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const fetchWeatherForecast = async (latitude: number, longitude: number): Promise<WeatherForecastData> => {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m,relative_humidity_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_min,relative_humidity_2m_max",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "auto",
    forecast_days: "5"
  });

  const url = `${OPEN_METEO_API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Open-Meteo API error:", errorData);
      throw new Error(`Failed to fetch weather forecast: ${errorData.reason || response.statusText}`);
    }
    const data = await response.json();
    
    if (!data.daily || !data.daily.time || !data.daily.weather_code || 
        !data.daily.temperature_2m_max || !data.daily.temperature_2m_min ||
        !data.daily.relative_humidity_2m_min || !data.daily.relative_humidity_2m_max) {
      console.error("Open-Meteo API response malformed (daily data missing or incomplete humidity):", data);
      throw new Error("Weather forecast data received is incomplete or malformed.");
    }

    const dailyForecasts: DailyForecast[] = data.daily.time.map((date: string, index: number) => ({
      date: date,
      minTemp: data.daily.temperature_2m_min[index],
      maxTemp: data.daily.temperature_2m_max[index],
      weatherCode: data.daily.weather_code[index],
      minHumidity: data.daily.relative_humidity_2m_min[index],
      maxHumidity: data.daily.relative_humidity_2m_max[index],
    }));
    
    let currentData;
    if (data.current && typeof data.current.temperature_2m !== 'undefined') {
        currentData = {
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            weatherCode: data.current.weather_code,
        }
    }

    return {
      current: currentData,
      daily: dailyForecasts,
    };
  } catch (error) {
    console.error("Error in fetchWeatherForecast:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred while fetching weather forecast.");
  }
};

export const searchLocations = async (query: string): Promise<SearchedLocation[]> => {
  if (!query.trim()) {
    return [];
  }
  const params = new URLSearchParams({
    name: query,
    count: "5", // Limit results for better UI
    language: "en",
    format: "json"
  });

  const url = `${GEOCODING_API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Open-Meteo Geocoding API error:", errorData);
      // Try to provide a more user-friendly error from the API if available
      const message = errorData?.message || errorData?.reason || `API request failed with status ${response.status}`;
      throw new Error(`Failed to search locations: ${message}`);
    }
    const data = await response.json();
    // The API returns results in a "results" array
    return (data.results || []) as SearchedLocation[];
  } catch (error) {
    console.error("Error in searchLocations:", error);
    if (error instanceof Error && error.message.startsWith('Failed to search locations:')) {
      throw error; // Re-throw specific API errors
    } else if (error instanceof Error) {
      throw new Error(`Location search encountered an issue: ${error.message}`);
    }
    throw new Error("An unknown error occurred while searching for locations.");
  }
};

export const WEATHER_CODE_MAP: Record<number, WeatherCodeMapping> = {
  0: { description: 'Clear sky', iconName: 'SunIcon' },
  1: { description: 'Mainly clear', iconName: 'SunIcon' },
  2: { description: 'Partly cloudy', iconName: 'CloudIconOutline' }, 
  3: { description: 'Overcast', iconName: 'CloudIconOutline' },
  45: { description: 'Fog', iconName: 'Bars3IconOutline' }, 
  48: { description: 'Depositing rime fog', iconName: 'Bars3IconOutline' },
  51: { description: 'Light drizzle', iconName: 'CloudArrowDownIconOutline' },
  53: { description: 'Moderate drizzle', iconName: 'CloudArrowDownIconOutline' },
  55: { description: 'Dense drizzle', iconName: 'CloudArrowDownIconOutline' },
  56: { description: 'Light freezing drizzle', iconName: 'CloudArrowDownIconOutline' }, 
  57: { description: 'Dense freezing drizzle', iconName: 'CloudArrowDownIconOutline' }, 
  61: { description: 'Slight rain', iconName: 'CloudArrowDownIconOutline' },
  63: { description: 'Moderate rain', iconName: 'CloudArrowDownIconOutline' },
  65: { description: 'Heavy rain', iconName: 'CloudArrowDownIconOutline' }, 
  66: { description: 'Light freezing rain', iconName: 'CloudArrowDownIconOutline' }, 
  67: { description: 'Heavy freezing rain', iconName: 'CloudArrowDownIconOutline' }, 
  71: { description: 'Slight snow fall', iconName: 'SnowflakeIconOutline' },
  73: { description: 'Moderate snow fall', iconName: 'SnowflakeIconOutline' },
  75: { description: 'Heavy snow fall', iconName: 'SnowflakeIconOutline' },
  77: { description: 'Snow grains', iconName: 'SnowflakeIconOutline' },
  80: { description: 'Slight rain showers', iconName: 'CloudArrowDownIconOutline' },
  81: { description: 'Moderate rain showers', iconName: 'CloudArrowDownIconOutline' },
  82: { description: 'Violent rain showers', iconName: 'CloudArrowDownIconOutline' },
  85: { description: 'Slight snow showers', iconName: 'SnowflakeIconOutline' },
  86: { description: 'Heavy snow showers', iconName: 'SnowflakeIconOutline' },
  95: { description: 'Thunderstorm', iconName: 'BoltIconOutline' }, 
  96: { description: 'Thunderstorm with slight hail', iconName: 'BoltIconOutline' },
  99: { description: 'Thunderstorm with heavy hail', iconName: 'BoltIconOutline' },
};

export const getWeatherDescriptionAndIcon = (weatherCode: number): WeatherCodeMapping => {
  return WEATHER_CODE_MAP[weatherCode] || { description: 'Unknown', iconName: 'QuestionMarkCircleIconOutline' };
};