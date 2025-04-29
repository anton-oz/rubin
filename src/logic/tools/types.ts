export interface PointsResponse {
  properties: {
    forecast?: string;
  };
}

export interface ForecastPeriod {
  number?: number;
  name?: string;
  temperature?: string;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
  detailedForecast?: string;
  startTime?: string;
  endTime?: string;
}

export interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}
