import OpenAI from "openai";
import { convoState } from "../filesystem";
import { getWeather, getForecast } from "../tools";
import { tools } from "../tools/toolSchema";
import { baseURL } from "./resources";

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

interface ToolResponse {
  id: string;
  message: string;
}

const handleToolCall = async (
  tool_calls: OpenAI.ChatCompletionMessageToolCall[],
): Promise<ToolResponse | null> => {
  for (const call of tool_calls) {
    const func = call.function;
    const args = JSON.parse(func.arguments);
    const id = call.id;

    let message: ToolResponse["message"];
    switch (func.name) {
      case "get_weather":
        const weather = await getWeather(args.latitude, args.longitude);
        if (!weather) {
          return {
            id,
            message: "Error: could not get weather",
          };
        }
        message = weather;
        return {
          id,
          message,
        };
      case "get_forecast":
        const forecast = await getForecast(args.latitude, args.longitude);
        if (!forecast) {
          return {
            id,
            message: "Error: could not get forecast",
          };
        }

        message = forecast;
        return {
          id,
          message,
        };
      default:
        console.log("Error: that cannot be good");
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
  history?: OpenAI.ChatCompletionMessageParam[],
) => {
  const message: OpenAI.ChatCompletionUserMessageParam = {
    role: "user",
    content: question,
  };

  try {
    console.time("getAnswer");
    const response = await client.chat.completions.create({
      model,
      messages: history ? history : [message],
      tools,
      tool_choice: "auto",
    });

    const finalText = [];

    const choice = response.choices[0].message;

    finalText.push(choice.content);
    const toolCalls = choice?.tool_calls;
    if (toolCalls !== undefined && toolCalls.length > 0) {
      const toolName = toolCalls[0].function.name;

      console.log(`[ Called ${toolName} ]\n`);
      console.time(`${toolName}`);
      const toolResult = await handleToolCall(toolCalls);
      console.timeEnd(`${toolName}`);

      if (toolResult) {
        const toolMessage: OpenAI.ChatCompletionToolMessageParam = {
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

    console.timeEnd("getAnswer");
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
