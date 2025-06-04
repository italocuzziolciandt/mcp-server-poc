import { z } from "zod";
import { WeatherForecastService } from "../service/weather-forecast.service.js";
import { PointsResponse } from "../service/models/points.model.js";
import { ForecastPeriod, ForecastResponse } from "../service/models/forecast.model.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export class ForecastTool {
  public readonly name = 'get-forecast';
  public readonly description = 'Provides weather forecast information for a given location.';
  public readonly parameters = {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z.number().min(-180).max(180).describe("Longitude of the location"),
  }

  constructor(private readonly weatherForecastService: WeatherForecastService) {}

  // Tool callback receives validated args and extra context
  public callback = async (
    { latitude, longitude }: z.infer<z.ZodObject<typeof this.parameters>>
  ): Promise<CallToolResult> => {
    // Get grid point data
    const pointsUrl = `${WeatherForecastService.NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await this.weatherForecastService.makeNWSRequest<PointsResponse>(pointsUrl);

    if (!pointsData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
          },
        ],
      };
    }

    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to get forecast URL from grid point data",
          },
        ],
      };
    }

    // Get forecast data
    const forecastData = await this.weatherForecastService.makeNWSRequest<ForecastResponse>(forecastUrl);
    if (!forecastData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve forecast data",
          },
        ],
      };
    }

    const periods = forecastData.properties?.periods || [];
    if (periods.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No forecast periods available",
          },
        ],
      };
    }

    // Format forecast periods
    const formattedForecast = periods.map((period: ForecastPeriod) =>
      [
        `${period.name || "Unknown"}:`,
        `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
        `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
        `${period.shortForecast || "No forecast available"}`,
        "---",
      ].join("\n"),
    );

    const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: forecastText,
        },
      ],
    };
  }
}