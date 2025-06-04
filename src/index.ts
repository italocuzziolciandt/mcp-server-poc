import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WeatherForecastService } from "./weather-forecast/services/weather-forecast.service.js";
import { ForecastTool } from "./weather-forecast/tools/forecast.tool.js";
import { AlertsTool } from "./weather-forecast/tools/alerts.tool.js";

const server = new McpServer({
  name: "mos-app",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

const weatherForecastService = new WeatherForecastService();
const forecastTool = new ForecastTool(weatherForecastService);
const alertstTool = new AlertsTool(weatherForecastService);

// Register weather tools
server.tool(
  alertstTool.name,
  alertstTool.description,
  alertstTool.parameters,
  alertstTool.callback
);

server.tool(
  forecastTool.name,
  forecastTool.description,
  forecastTool.parameters,
  forecastTool.callback,
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});