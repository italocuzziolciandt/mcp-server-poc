export class WeatherForecastService {
  public static readonly NWS_API_BASE = "https://api.weather.gov";
  public static readonly USER_AGENT = "weather-app/1.0";

  constructor() {
  }

  async makeNWSRequest<T>(url: string): Promise<T | null> {
    const headers = {
      "User-Agent": WeatherForecastService.USER_AGENT,
      Accept: "application/geo+json",
    };
  
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error("Error making NWS request:", error);
      return null;
    }
  }
}