import { ChatCompletionTool } from "openai/resources.mjs";

export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description:
        "get the current weather for a location in the united states utilzing latitude and longitude.",
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
      description:
        "gets the forecast for the next few days for a location in the united states utilizing latitude and longitude",
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
