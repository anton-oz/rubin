import { ChatCompletionTool } from "openai/resources.mjs";

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
