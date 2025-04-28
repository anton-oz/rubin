import OpenAI from "openai";
import { baseURL } from "./resources";
import { ChatCompletionMessageParam } from "openai/src/resources.js";
import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources.mjs";
import { warn } from "console";
import { convoState } from "../filesystem";

const client = new OpenAI({
  baseURL,
  apiKey: "nothing",
});

export const getModelName = async () => {
  try {
    const res = await fetch(`${baseURL}/models`);
    const { data } = await res.json();
    const name = data[0].id;
    return name;
  } catch (e) {
    console.error(
      "ERROR: Server not running or non-responsive\n\tAre you sure its running?\n\n",
      e,
    );
    process.exit(1);
  }
};

/**
 * NOTE:
 * tools
 */

interface PointsResponse {
  properties: {
    forecast?: string;
  };
}

interface ForecastPeriod {
  name?: string;
  temperature?: string;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}
async function fetchURL<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return data as T;
}

const getWeather = async (latitude: number, longitude: number) => {
  const base_weather_api = "https://api.weather.gov";
  const points_endpoint = `${base_weather_api}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  try {
    const pointsData = await fetchURL<PointsResponse>(points_endpoint);
    const forecastURL = pointsData.properties?.forecast;
    if (!forecastURL) {
      throw new Error("Error: could not get forecast url.");
    }

    const forecastData = await fetchURL<ForecastResponse>(forecastURL);
    const forecastInfo = [];
    const periods = forecastData.properties.periods;
    for (const period in periods) {
      forecastInfo.push(periods[period]);
    }

    return JSON.stringify(forecastInfo);
  } catch (error) {
    console.error("Error making weather request: ", error);
    return null;
  }
};
// NOTE: test prompt
// get the longitude and latitude for san francisco california, and find the weather

const tools: ChatCompletionTool[] = [
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
];

interface ToolResponse {
  id: string;
  message: string;
}

const handleToolCall = async (
  tool_calls: ChatCompletionMessageToolCall[],
): Promise<ToolResponse | null> => {
  for (const call of tool_calls) {
    const func = call.function;
    const args = JSON.parse(func.arguments);
    const id = call.id;

    switch (func.name) {
      case "get_weather":
        const forecast = await getWeather(args.latitude, args.longitude);
        if (!forecast) {
          return {
            id,
            message: "Error: could not get forecast",
          };
        }
        const message = forecast;

        // const message = `${forecast.name} it will be ${forecast.temp}, ${forecast.description}`;

        return {
          id,
          message,
        };
      default:
        return null;
    }
  }
  console.error("Error: how did I get here?");
  return null;
};

/**
 * Gets the answer and adds to history.
 *
 * TODO: create seperate function for adding to history for cleaner code.
 */
export const getAnswer = async (
  model: string,
  question: string,
  history?: ChatCompletionMessageParam[],
) => {
  const message: ChatCompletionUserMessageParam = {
    role: "user",
    content: question,
  };

  try {
    const response = await client.chat.completions.create({
      model,
      messages: history ? history : [message],
      tools,
      tool_choice: "auto",
    });

    const finalText = [];

    const choice = response.choices[0];

    finalText.push(choice.message.content);
    const toolCalls = choice.message?.tool_calls;
    if (toolCalls !== undefined && toolCalls.length > 0) {
      const toolName = toolCalls[0].function.name;
      const toolArgs = toolCalls[0].function.arguments;

      const toolResult = await handleToolCall(toolCalls);
      finalText.push(`[ Called ${toolName} ]\n`);

      if (toolResult) {
        const toolMessage: ChatCompletionToolMessageParam = {
          tool_call_id: toolResult.id,
          role: "tool",
          content: toolResult.message,
        };
        if (history) {
          history.push(toolMessage);
        } else {
          const history = convoState.getHistory();
          history.push(toolMessage);
        }
      }

      const response = await client.chat.completions.create({
        model,
        messages: history ? history : convoState.getHistory(),
      });
      const text = response.choices[0].message.content;

      finalText.push(text);
    }

    return finalText.join("\n");

    // NOTE: streaming shit
    // const stream = await client.chat.completions.create({
    //   model,
    //   messages: history ? history : [message],
    //   stream: true,
    //   tools,
    //   tool_choice: "auto",
    // });
    // for await (const content of stream) {
    //   console.log(content.choices[0].delta.content);
    // }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
