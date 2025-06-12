import z from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

export class StudioCreationTool {
  public readonly name = 'create-studio';
  public readonly description = 'Creates a json schema that is considered a studio inside the Modernization Studio.';
  public readonly parameters = {
    name: z.string().describe("Name of the studio to be created."),
    purpose: z.string().describe("Description of the studio's purpose."),
    directory: z.string().describe("The full directory path where the studio will be created."),
  }

  constructor() {}

  public callback = async (
    { name, purpose, directory }: z.infer<z.ZodObject<typeof this.parameters>>
  ): Promise<CallToolResult> => {
    const studioSchema = {
      id: name,
      version: "1.0.0",
      title: name,
      description: purpose,
      targets: [
        {
          id: "",
          label: "",
          description: "",
          patterns: [] as string[],
          commands: [
            {
              id: "",
              version: "",
              label: "",
              protocol: {
                type: "",
                mode: "",
                source: "",
                executable: "",
                command_template: ""
              },
              parameters: {
                config_auth: {
                  value: "{auth}",
                  required: true
                },
                output: {
                  value: "{output_dir}/docs/jobs/{selected_filename}/index.md",
                  required: true,
                  is_output: true
                }
              }
            }
          ],
          tags: [""]
        }
      ],
      tags: [""]
    };

    try {
      await fs.mkdir(directory, { recursive: true });
      const filePath = path.join(directory, `${name}.json`);

      await fs.writeFile(filePath, JSON.stringify(studioSchema, null, 2), "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `Studio schema created at ${filePath}`
          }
        ]
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text",
            text: `Error creating studio schema: ${msg}`
          }
        ]
      };
    }
  }
}