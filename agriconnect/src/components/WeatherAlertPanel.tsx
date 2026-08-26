import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  AlertTriangle,
  Sprout,
  Droplet,
  Bug,
  Scissors,
  RefreshCw,
  Loader2,
  MapPin,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface WeatherAlertPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: string;
}

interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: string;
  uvIndex: number;
  visibility: number;
  pressure: number;
}

interface ForecastDay {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  rainChance: number;
  rainfall: number;
}

interface WeatherAlert {
  type: string;
  severity: string;
  title: string;
  message: string;
  action: string;
}

interface FarmingAdvisory {
  irrigation: string;
  pestRisk: string;
  harvestAdvice: string;
  generalTip: string;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  alerts: WeatherAlert[];
  farmingAdvisory: FarmingAdvisory;
  location: string;
  lastUpdated: string;
}

const getConditionIcon = (condition: string, size = 'w-5 h-5') => {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) return <CloudLightning className={`${size} text-purple-500`} />;
  if (c.includes('rain') || c.includes('shower')) return <CloudRain className={`${size} text-blue-500`} />;
  if (c.includes('fog') || c.includes('mist')) return <CloudFog className={`${size} text-slate-400`} />;
  if (c.includes('cloud')) return <Cloud className={`${size} text-slate-500`} />;
  if (c.includes('haz')) return <Cloud className={`${size} text-amber-400`} />;
  return <Sun className={`${size} text-amber-500`} />;
};

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-rose-100 border-rose-300 text-rose-800';
    case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
    case 'medium': return 'bg-amber-100 border-amber-300 text-amber-800';
    default: return 'bg-blue-100 border-blue-300 text-blue-800';
  }
};

const getSeverityDot = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-rose-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-amber-500';
    default: return 'bg-blue-500';
  }
};

const getUvLabel = (uv: number) => {
  if (uv <= 2) return { text: 'Low', color: 'text-emerald-600' };
  if (uv <= 5) return { text: 'Moderate', color: 'text-amber-600' };
  if (uv <= 7) return { text: 'High', color: 'text-orange-600' };
  if (uv <= 10) return { text: 'Very High', color: 'text-rose-600' };
  return { text: 'Extreme', color: 'text-purple-600' };
};

interface CropWeatherRisksProps {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  condition: string;
  forecast: ForecastDay[];
  cropInput: string;
}

const CropWeatherRisks: React.FC<CropWeatherRisksProps> = ({
  temperature, humidity, windSpeed, uvIndex, condition, forecast, cropInput,
}) => {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  const risks: { key: string; label: string; level: 'low' | 'medium' | 'high' | 'critical'; icon: React.ReactNode; detail: string; protection: string }[] = [];

  // Temperature stress
  if (temperature > 42) {
    risks.push({ key: 'heat-stress', label: 'Extreme Heat Stress', level: 'critical', icon: <Thermometer className="w-3.5 h-3.5 text-rose-500" />, detail: `Temperature at ${temperature}°C — extreme heat can cause flower drop, leaf scorch, and irreversible yield loss.`, protection: 'Shade nets (40-50%), increased drip irrigation frequency, mulching to retain soil moisture. Avoid mid-day field operations.' });
  } else if (temperature > 38) {
    risks.push({ key: 'heat-stress', label: 'High Temperature Risk', level: 'high', icon: <Thermometer className="w-3.5 h-3.5 text-orange-500" />, detail: `Temperature at ${temperature}°C — may cause heat stress in sensitive crops like tomato, wheat, and pulses.`, protection: 'Light irrigation in early morning, foliar spray of 0.5% KCl to improve heat tolerance. Mulch around base of plants.' });
  } else if (temperature < 5) {
    risks.push({ key: 'frost', label: 'Frost / Cold Wave Alert', level: 'critical', icon: <Thermometer className="w-3.5 h-3.5 text-blue-500" />, detail: `Temperature at ${temperature}°C — frost can kill seedlings and damage standing crops severely.`, protection: 'Light irrigation before nightfall (water retains heat), use plastic tunnels or row covers, smoke pots for orchards.' });
  }

  // Humidity risks
  if (humidity > 90) {
    risks.push({ key: 'fungal', label: 'High Humidity — Fungal Risk', level: 'high', icon: <Droplets className="w-3.5 h-3.5 text-blue-500" />, detail: `${humidity}% humidity creates ideal conditions for fungal diseases like blight, mildew, and rust.`, protection: 'Apply preventive fungicide (Mancozeb 75% WP @ 2.5 g/L), improve air circulation by pruning, avoid overhead irrigation.' });
  } else if (humidity > 80) {
    risks.push({ key: 'fungal', label: 'Moderate Humidity — Monitor Closely', level: 'medium', icon: <Droplets className="w-3.5 h-3.5 text-amber-500" />, detail: `${humidity}% humidity — elevated risk of leaf spot and downy mildew in vulnerable crops.`, protection: 'Monitor leaf undersides daily for early spore signs, maintain balanced nitrogen (avoid excess N), ensure good drainage.' });
  }

  // Wind risk
  if (windSpeed > 50) {
    risks.push({ key: 'wind', label: 'Severe Wind / Storm Damage', level: 'critical', icon: <Wind className="w-3.5 h-3.5 text-purple-500" />, detail: `Wind speed ${windSpeed} km/h — may flatten tall crops (maize, sugarcane, cotton) and uproot trees.`, protection: 'Stake tall plants, tie climbing crops to supports, secure greenhouse poly-tunnels, harvest mature crops immediately if possible.' });
  } else if (windSpeed > 30) {
    risks.push({ key: 'wind', label: 'Strong Winds — Lodging Risk', level: 'medium', icon: <Wind className="w-3.5 h-3.5 text-slate-500" />, detail: `Wind speed ${windSpeed} km/h — may cause lodging in wheat, rice, and other cereals.`, protection: 'Avoid freshly transplanted seedlings exposure, ensure adequate potassium nutrition for stem strength, avoid late nitrogen application.' });
  }

  // UV risk
  if (uvIndex > 9) {
    risks.push({ key: 'uv', label: 'Extreme UV — Leaf Burn Risk', level: 'high', icon: <Sun className="w-3.5 h-3.5 text-amber-500" />, detail: `UV Index ${uvIndex} — extreme radiation can cause sunscald on fruits and leaf burn on young seedlings.`, protection: 'Use shade nets (30-40%), water seedlings in early morning, apply Kaolin clay spray for sun protection on fruits.' });
  }

  // Rain forecast risk
  const heavyRainDay = forecast?.find(d => d.rainChance > 70 && d.rainfall > 20);
  if (heavyRainDay) {
    risks.push({ key: 'heavy-rain', label: `Heavy Rain Expected (${heavyRainDay.day})`, level: 'high', icon: <CloudRain className="w-3.5 h-3.5 text-blue-500" />, detail: `${heavyRainDay.rainChance}% chance of ${heavyRainDay.rainfall}mm rainfall on ${heavyRainDay.day} — risk of waterlogging, root rot, and post-harvest crop damage.`, protection: 'Ensure field drainage channels are clear, cover harvested produce with tarpaulins, delay sowing/transplanting, lift mature crops before rain.' });
  }

  // Storm forecast
  const stormDay = forecast?.find(d => d.condition.toLowerCase().includes('thunder') || d.condition.toLowerCase().includes('storm'));
  if (stormDay) {
    risks.push({ key: 'storm', label: `Thunderstorm Expected (${stormDay.day})`, level: 'critical', icon: <CloudLightning className="w-3.5 h-3.5 text-purple-500" />, detail: `Thunderstorm predicted on ${stormDay.day} — risk of hail, lightning, and sudden wind gusts damaging standing crops.`, protection: 'Secure livestock shelters, move harvested grain to safe storage, avoid chemical spraying (rain will wash off), set up hail nets for high-value crops.' });
  }

  // Soil moisture estimate
  const soilMoisture = humidity > 80 ? 'High (monitor drainage)' : humidity > 60 ? 'Adequate' : humidity > 40 ? 'Moderate — consider irrigation' : 'Low — irrigation needed soon';
  const soilMoistureLevel = humidity > 80 ? 'high' : humidity > 60 ? 'good' : humidity > 40 ? 'moderate' : 'low';

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-rose-100 border-rose-300 text-rose-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-amber-100 border-amber-300 text-amber-800';
      default: return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    }
  };

  const getSoilBadge = (level: string) => {
    switch (level) {
      case 'high': return 'bg-blue-100 text-blue-700';
      case 'good': return 'bg-emerald-100 text-emerald-700';
      case 'moderate': return 'bg-amber-100 text-amber-700';
      default: return 'bg-rose-100 text-rose-700';
    }
  };

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">🛡️ Crop Weather Risks & Protection</span>

      {/* Soil Moisture Estimate */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-bold text-slate-700">Estimated Soil Moisture</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSoilBadge(soilMoistureLevel)} border-current/20`}>{soilMoisture}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Based on current humidity ({humidity}%) and recent weather patterns</p>
      </div>

      {/* Risk Items */}
      {risks.length === 0 ? (
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-emerald-800">All Clear — Low Risk</p>
              <p className="text-[10px] text-emerald-600">No significant weather threats detected for your crops right now.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {risks.map((risk) => (
            <div
              key={risk.key}
              className="bg-white rounded-xl border border-slate-200 p-3 hover:border-slate-300 transition cursor-pointer"
              onClick={() => setExpandedRisk(expandedRisk === risk.key ? null : risk.key)}
              id={`crop-risk-${risk.key}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  {risk.icon}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">{risk.label}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRiskBadgeColor(risk.level)}`}>{risk.level.toUpperCase()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{risk.detail}</p>
                  </div>
                </div>
                {expandedRisk === risk.key ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />}
              </div>
              {expandedRisk === risk.key && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">🛡️ Protection Action:</p>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{risk.protection}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const WeatherAlertPanel: React.FC<WeatherAlertPanelProps> = ({
  isOpen,
  onClose,
  userLocation = 'Bardoli, Gujarat, India'
}) => {
  if (!isOpen) return null;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [expandedAdvisory, setExpandedAdvisory] = useState<string | null>(null);
  const [cropInput, setCropInput] = useState('wheat');

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: userLocation, crop: cropInput }),
      });
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();
      if (data.data) {
        setWeather(data.data);
      } else {
        throw new Error('No weather data returned');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load weather data');
    } finally {
      setLoading(false);
    }
  }, [userLocation, cropInput]);

  useEffect(() => {
    if (isOpen) fetchWeather();
  }, [isOpen, fetchWeather]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-xs" id="weather-alert-panel">
      <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Weather & Farm Alerts</h3>
              <div className="flex items-center gap-1 text-[10px] text-blue-100">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[180px]">{userLocation}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer disabled:opacity-50"
              title="Refresh weather"
              id="weather-refresh-btn"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
              id="close-weather-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading */}
          {loading && !weather && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Fetching weather data...</p>
              <p className="text-xs text-slate-500">Analyzing conditions for farming advisory</p>
            </div>
          )}

          {/* Error */}
          {error && !weather && (
            <div className="py-12 text-center space-y-3 px-4">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Unable to load weather</p>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={fetchWeather}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Weather Content */}
          {weather && (
            <div className="p-4 space-y-4">

              {/* Active Alerts Banner */}
              {weather.alerts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Active Alerts ({weather.alerts.length})
                    </span>
                  </div>
                  {weather.alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3 transition-all cursor-pointer ${getSeverityStyle(alert.severity)}`}
                      onClick={() => setExpandedAlert(expandedAlert === idx ? null : idx)}
                      id={`weather-alert-${idx}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${getSeverityDot(alert.severity)}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold">{alert.title}</p>
                            <p className="text-[11px] mt-0.5 opacity-80">{alert.message}</p>
                          </div>
                        </div>
                        {expandedAlert === idx ? <ChevronUp className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      </div>
                      {expandedAlert === idx && (
                        <div className="mt-2 pt-2 border-t border-current/10 text-[11px] font-semibold opacity-90">
                          <span className="font-bold">Recommended Action:</span> {alert.action}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Current Conditions */}
              {weather.current && (
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Current Conditions</span>
                    <span className="text-[10px] text-blue-400">
                      Updated {new Date(weather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getConditionIcon(weather.current.condition, 'w-12 h-12')}
                      <div>
                        <p className="text-3xl font-bold text-slate-800">{weather.current.temperature}°C</p>
                        <p className="text-xs text-slate-500">Feels like {weather.current.feelsLike}°C</p>
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold text-slate-700">{weather.current.condition}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Rain: {weather.current.humidity > 70 ? 'Likely' : 'Unlikely'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-blue-100">
                    <div className="text-center">
                      <Droplets className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
                      <p className="text-[10px] text-slate-500">Humidity</p>
                      <p className="text-xs font-bold text-slate-700">{weather.current.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <Wind className="w-3.5 h-3.5 text-teal-500 mx-auto mb-0.5" />
                      <p className="text-[10px] text-slate-500">Wind</p>
                      <p className="text-xs font-bold text-slate-700">{weather.current.windSpeed} km/h</p>
                    </div>
                    <div className="text-center">
                      <Sun className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                      <p className="text-[10px] text-slate-500">UV Index</p>
                      <p className={`text-xs font-bold ${getUvLabel(weather.current.uvIndex).color}`}>
                        {weather.current.uvIndex} • {getUvLabel(weather.current.uvIndex).text}
                      </p>
                    </div>
                    <div className="text-center">
                      <Eye className="w-3.5 h-3.5 text-purple-500 mx-auto mb-0.5" />
                      <p className="text-[10px] text-slate-500">Visibility</p>
                      <p className="text-xs font-bold text-slate-700">{weather.current.visibility} km</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 7-Day Forecast */}
              {weather.forecast && weather.forecast.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">7-Day Forecast</span>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weather.forecast.map((day, idx) => (
                      <div
                        key={idx}
                        className={`text-center p-1.5 sm:p-2 rounded-xl transition ${
                          idx === 0
                            ? 'bg-blue-100 border border-blue-200 ring-1 ring-blue-300'
                            : 'bg-slate-50 border border-slate-100 hover:border-blue-200'
                        }`}
                        id={`forecast-day-${idx}`}
                      >
                        <p className="text-[9px] font-bold text-slate-600 truncate">{day.day.slice(0, 3)}</p>
                        <div className="my-1">{getConditionIcon(day.condition, 'w-4 h-4 mx-auto')}</div>
                        <p className="text-[10px] font-bold text-slate-800">{day.high}°</p>
                        <p className="text-[9px] text-slate-400">{day.low}°</p>
                        {day.rainChance > 0 && (
                          <div className="mt-1 flex items-center justify-center gap-0.5">
                            <Droplets className="w-2 h-2 text-blue-400" />
                            <span className="text-[8px] text-blue-500 font-semibold">{day.rainChance}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Farming Advisory */}
              {weather.farmingAdvisory && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">🚜 Farming Advisory</span>

                  {[
                    { key: 'irrigation', icon: <Droplet className="w-3.5 h-3.5 text-blue-500" />, label: 'Irrigation', value: weather.farmingAdvisory.irrigation },
                    { key: 'pestRisk', icon: <Bug className="w-3.5 h-3.5 text-rose-500" />, label: 'Pest Risk', value: weather.farmingAdvisory.pestRisk },
                    { key: 'harvestAdvice', icon: <Scissors className="w-3.5 h-3.5 text-emerald-500" />, label: 'Harvest', value: weather.farmingAdvisory.harvestAdvice },
                    { key: 'generalTip', icon: <Sprout className="w-3.5 h-3.5 text-amber-500" />, label: 'Pro Tip', value: weather.farmingAdvisory.generalTip },
                  ].map(({ key, icon, label, value }) => (
                    <div
                      key={key}
                      className="bg-white rounded-xl border border-slate-200 p-3 hover:border-blue-200 transition cursor-pointer"
                      onClick={() => setExpandedAdvisory(expandedAdvisory === key ? null : key)}
                      id={`advisory-${key}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className="text-xs font-bold text-slate-700">{label}</span>
                        </div>
                        {expandedAdvisory === key ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                      {expandedAdvisory === key && (
                        <p className="mt-2 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                          {value}
                        </p>
                      )}
                      {expandedAdvisory !== key && (
                        <p className="mt-1 text-[10px] text-slate-400 truncate">{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Crop-Specific Weather Risks & Protection Actions */}
              {weather.current && (
                <CropWeatherRisks
                  temperature={weather.current.temperature}
                  humidity={weather.current.humidity}
                  windSpeed={weather.current.windSpeed}
                  uvIndex={weather.current.uvIndex}
                  condition={weather.current.condition}
                  forecast={weather.forecast}
                  cropInput={cropInput}
                />
              )}

              {/* Crop Context Input */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Crop Context for Advisory
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cropInput}
                    onChange={(e) => setCropInput(e.target.value)}
                    placeholder="e.g. wheat, rice, tomato..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="weather-crop-input"
                  />
                  <button
                    onClick={fetchWeather}
                    disabled={loading}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    id="weather-update-crop-btn"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
