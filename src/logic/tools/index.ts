import { ChatCompletionTool } from "openai/resources.mjs";
import { fetchURL, formatPeriod } from "./resources";
import { PointsResponse, ForecastResponse } from "./types";

export const getForecast = async (latitude: number, longitude: number) => {
  const base_weather_api = "https://api.weather.gov";
  const points_endpoint = `${base_weather_api}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  try {
    const pointsData = await fetchURL<PointsResponse>(points_endpoint);
    const forecastURL = pointsData.properties?.forecast;
    if (!forecastURL) {
      throw new Error("Error: could not get forecast url.");
    }

    const forecastData = await fetchURL<ForecastResponse>(forecastURL);
    const forecastInfo = [];
    const periods = forecastData.properties.periods;
    for (const i in periods) {
      const period = periods[i];
      const num = period.number;
      if (num && num > 5) break;
      forecastInfo.push(formatPeriod(period));
    }
    return JSON.stringify(forecastInfo);
  } catch (error) {
    console.error("Error getting forecast.", error);
    return null;
  }
};

export const getWeather = async (latitude: number, longitude: number) => {
  const base_weather_api = "https://api.weather.gov";
  const points_endpoint = `${base_weather_api}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  try {
    const pointsData = await fetchURL<PointsResponse>(points_endpoint);
    const forecastURL = pointsData.properties?.forecast;
    if (!forecastURL) {
      throw new Error("Error: could not get forecast url.");
    }

    const forecastData = await fetchURL<ForecastResponse>(forecastURL);

    // current weather data only
    const current = forecastData.properties?.periods[0];
    if (!current) {
      throw new Error("Error: could not get current forecast data");
    }

    const formatForecast = {
      ...formatForecastPeriod(current),
    };
    return JSON.stringify(formatForecast);
  } catch (error) {
    console.error("Error making weather request: ", error);
    return null;
  }
};

export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "get the weather for the input location.",
      parameters: {
        type: "object",
        properties: {
          latitude: {
            type: "number",
            description: "the latitude number of the input location",
          },
          longitude: {
            type: "number",
            description: "the longitude number of the input location",
          },
        },
        required: ["latitude", "longitude"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_forecast",
      description: "get the forecast for the input location",
      parameters: {
        type: "object",
        properties: {
          latitude: {
            type: "number",
            description: "the latitude number of the input location",
          },
          longitude: {
            type: "number",
            description: "the longitude number of the input location",
          },
          required: ["latitude", "longitude"],
        },
      },
    },
  },
];
