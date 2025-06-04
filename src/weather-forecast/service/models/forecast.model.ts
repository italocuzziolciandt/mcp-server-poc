export interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

export interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}