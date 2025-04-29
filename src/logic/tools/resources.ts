import { ForecastPeriod } from "./types";

export async function fetchURL<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return data as T;
}

export function formatPeriod(period: ForecastPeriod) {
  const {
    name,
    temperature,
    temperatureUnit,
    windSpeed,
    windDirection,
    shortForecast,
    detailedForecast,
    startTime,
    endTime,
  } = period;
  const relevantInfo: ForecastPeriod = {
    name,
    temperature,
    temperatureUnit,
    windSpeed,
    windDirection,
    shortForecast,
    detailedForecast,
    startTime,
    endTime,
  };
  return relevantInfo;
}
