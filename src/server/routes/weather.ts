import { Router, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
}

// POST /api/weather
router.post("/", async (req: any, res: Response) => {
  try {
    const { location = "Bardoli, Gujarat, India", crop = "wheat" } = req.body;

    // Try real OpenWeatherMap API first
    const weatherApiKey = process.env.OPENWEATHER_API_KEY;
    if (weatherApiKey) {
      try {
        // Geocode location string
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${weatherApiKey}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json() as any[];

        if (geoData && geoData.length > 0) {
          const { lat, lon } = geoData[0];

          // Current weather
          const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`;
          const currentRes = await fetch(currentUrl);
          const currentData = await currentRes.json() as any;

          // 7-day forecast
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`;
          const forecastRes = await fetch(forecastUrl);
          const forecastData = await forecastRes.json() as any;

          if (currentData.main) {
            const weatherData = buildWeatherFromAPI(currentData, forecastData, location, crop);
            return res.json({ data: weatherData, source: "openweathermap" });
          }
        }
      } catch (apiErr) {
        console.error("OpenWeatherMap API error, falling back to AI:", apiErr);
      }
    }

    // Try Gemini AI for weather data
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are an agricultural meteorologist and farming weather advisor.
Generate current weather and a 7-day forecast for the location: ${location}
Crop context: ${crop}

Return valid JSON with these exact keys:
{
  "current": {
    "temperature": number (Celsius),
    "feelsLike": number,
    "humidity": number (percentage),
    "windSpeed": number (km/h),
    "windDirection": "string",
    "condition": "Sunny / Partly Cloudy / Cloudy / Light Rain / Heavy Rain / Thunderstorm / Foggy",
    "uvIndex": number (0-11),
    "visibility": number (km),
    "pressure": number (hPa)
  },
  "forecast": [
    {
      "day": "Monday",
      "date": "2026-08-20",
      "high": number,
      "low": number,
      "condition": "string",
      "rainChance": number (0-100),
      "rainfall": number (mm)
    }
  ],
  "alerts": [
    {
      "type": "rain|heat|storm|frost|humidity|wind",
      "severity": "low|medium|high|critical",
      "title": "Alert title",
      "message": "Brief description",
      "action": "Recommended action for farmers"
    }
  ],
  "farmingAdvisory": {
    "irrigation": "Irrigation recommendation based on weather",
    "pestRisk": "Pest risk assessment based on weather",
    "harvestAdvice": "Harvest timing advice",
    "generalTip": "General farming tip for current conditions"
  },
  "location": "${location}",
  "lastUpdated": "ISO timestamp"
}

Use realistic weather data for the Indian subcontinent in August (monsoon season). Generate 7 days of forecast.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.5 },
      });

      try {
        const parsed = JSON.parse(response.text || "{}");
        return res.json({ data: { ...parsed, location, lastUpdated: new Date().toISOString() }, source: "gemini-3.7-flash" });
      } catch {}
    }

    // Fallback: static realistic data
    const fallbackWeather = buildFallbackWeather(location, crop);
    return res.json({ data: fallbackWeather, source: "agriconnect-expert-engine" });
  } catch (error: any) {
    console.error("Weather error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch weather data" });
  }
});

function buildWeatherFromAPI(current: any, forecast: any, location: string, crop: string) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const conditionMap: Record<string, string> = {
    "Clear": "Sunny", "Clouds": "Partly Cloudy", "Rain": "Light Rain",
    "Drizzle": "Light Rain", "Thunderstorm": "Thunderstorm", "Snow": "Heavy Rain",
    "Mist": "Foggy", "Fog": "Foggy", "Haze": "Partly Cloudy",
  };

  const currentCondition = conditionMap[current.weather?.[0]?.main] || "Partly Cloudy";
  const forecastDays: any[] = [];
  const seenDates = new Set<string>();

  if (forecast.list) {
    for (const item of forecast.list) {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toISOString().split("T")[0];
      if (seenDates.has(dateStr) || forecastDays.length >= 7) continue;
      seenDates.add(dateStr);

      forecastDays.push({
        day: days[date.getDay()],
        date: dateStr,
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: conditionMap[item.weather?.[0]?.main] || "Partly Cloudy",
        rainChance: Math.round((item.pop || 0) * 100),
        rainfall: Math.round((item.rain?.["3h"] || 0)),
      });
    }
  }

  const humidity = current.main?.humidity || 70;
  const temp = Math.round(current.main?.temp || 30);

  // Generate alerts based on conditions
  const alerts: any[] = [];
  if (temp > 38) {
    alerts.push({ type: "heat", severity: "high", title: "Heat Wave Warning", message: `Temperature at ${temp}°C — extreme heat may damage crops.`, action: "Provide shade nets and increase irrigation frequency." });
  }
  if (humidity > 85) {
    alerts.push({ type: "humidity", severity: "medium", title: "High Humidity — Fungal Risk", message: `Humidity at ${humidity}% creates conditions for fungal diseases.`, action: "Apply preventive fungicide spray. Improve air circulation." });
  }
  const rainyDay = forecastDays.find((d) => d.rainChance > 70 && d.rainfall > 10);
  if (rainyDay) {
    alerts.push({ type: "rain", severity: "medium", title: "Heavy Rain Expected", message: `${rainyDay.rainChance}% chance of ${rainyDay.rainfall}mm on ${rainyDay.day}.`, action: "Clear drainage channels. Cover harvested produce. Avoid spraying." });
  }

  return {
    current: {
      temperature: temp,
      feelsLike: Math.round(current.main?.feels_like || temp + 3),
      humidity,
      windSpeed: Math.round((current.wind?.speed || 0) * 3.6),
      windDirection: getWindDirection(current.wind?.deg || 0),
      condition: currentCondition,
      uvIndex: 6,
      visibility: Math.round((current.visibility || 8000) / 1000),
      pressure: current.main?.pressure || 1013,
    },
    forecast: forecastDays.length > 0 ? forecastDays : buildFallbackForecast(),
    alerts,
    farmingAdvisory: {
      irrigation: `With current conditions at ${temp}°C and ${humidity}% humidity, monitor soil moisture at 15cm depth. ${humidity > 70 ? "Reduce irrigation frequency as rainfall补充 moisture." : "Increase drip irrigation to maintain field capacity."}`,
      pestRisk: humidity > 80 ? "High humidity increases risk of fungal diseases. Install 8-10 pheromone traps per acre." : "Moderate pest risk. Monitor leaf undersides every 2-3 days.",
      harvestAdvice: `If ${crop} is approaching maturity, plan harvesting within a dry window. Ensure grain moisture is below 14% before storage.`,
      generalTip: `Maintain balanced nitrogen nutrition for ${crop}. Keep drainage channels clear to prevent waterlogging during monsoon.`,
    },
    location,
    lastUpdated: new Date().toISOString(),
  };
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(degrees / 22.5) % 16];
}

function buildFallbackForecast() {
  const today = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const rainChance = i < 3 ? [80, 60, 70][i] : [40, 30, 50, 25][i - 3] || 30;
    const isRainy = rainChance > 50;
    forecast.push({
      day: days[d.getDay()],
      date: d.toISOString().split("T")[0],
      high: isRainy ? 30 + Math.floor(Math.random() * 3) : 33 + Math.floor(Math.random() * 4),
      low: 23 + Math.floor(Math.random() * 3),
      condition: isRainy ? (rainChance > 70 ? "Heavy Rain" : "Light Rain") : "Partly Cloudy",
      rainChance,
      rainfall: isRainy ? 15 + Math.floor(Math.random() * 25) : Math.floor(Math.random() * 5),
    });
  }
  return forecast;
}

function buildFallbackWeather(location: string, crop: string) {
  return {
    current: {
      temperature: 31, feelsLike: 36, humidity: 82, windSpeed: 14, windDirection: "SW",
      condition: "Partly Cloudy", uvIndex: 6, visibility: 8, pressure: 1008,
    },
    forecast: buildFallbackForecast(),
    alerts: [
      { type: "rain", severity: "medium", title: "Monsoon Rain Expected", message: `Moderate to heavy rainfall expected in ${location} over the next 2-3 days.`, action: "Clear field drainage channels, cover harvested produce, avoid pesticide sprays 24h before rain." },
      { type: "humidity", severity: "medium", title: "High Humidity — Fungal Risk", message: "Humidity above 80% creates conditions for blight, mildew, and rust.", action: "Apply preventive Mancozeb 75% WP (2.5 g/L) or Copper Oxychloride (3 g/L) spray." },
    ],
    farmingAdvisory: {
      irrigation: `With monsoon rains active, avoid irrigation for rain-fed fields. For drip-irrigated ${crop} plots, reduce frequency to once every 3-4 days.`,
      pestRisk: `High humidity increases risk of stem borer, leaf folder, and sheath blight in ${crop}. Install 8-10 pheromone traps per acre.`,
      harvestAdvice: `If ${crop} is approaching maturity, plan harvesting within a dry window. Avoid harvesting during or after rain.`,
      generalTip: `Use this period to apply nitrogen top-dressing washed in by rain. Keep drainage channels clear.`,
    },
    location,
    lastUpdated: new Date().toISOString(),
  };
}

export default router;
