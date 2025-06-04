import z from "zod";
import { WeatherForecastService } from "../service/weather-forecast.service.js";
import { AlertsResponse, formatAlert } from "../service/models/alert.model.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export class AlertsTool {
  public readonly name = 'get-alerts';
  public readonly description = 'Provides weather alerts for a state.';
  public readonly parameters = {
    state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
  }

  constructor(private readonly weatherForecastService: WeatherForecastService) {}

  // Tool callback receives validated args and extra context
  public callback = async (
    { state }: z.infer<z.ZodObject<typeof this.parameters>>
  ): Promise<CallToolResult> => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${WeatherForecastService.NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await this.weatherForecastService.makeNWSRequest<AlertsResponse>(alertsUrl);

    if (!alertsData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve alerts data",
          },
        ],
      };
    }

    const features = alertsData.features || [];
    if (features.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No active alerts for ${stateCode}`,
          },
        ],
      };
    }

    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: alertsText,
        },
      ],
    };
  }
}