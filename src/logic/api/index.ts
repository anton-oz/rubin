import OpenAI from "openai";
import { baseURL } from "./resources";
import { ChatCompletionUserMessageParam } from "openai/resources.mjs";

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

export const getAnswer = async (
  model: string,
  question: string,
  history?: ChatCompletionUserMessageParam[],
) => {
  try {
    const response = await client.chat.completions.create({
      model,
      // NOTE: ChatCompletionsUserMessageParam
      messages: history || [{ role: "user", content: question }],
    });
    const answer = response.choices[0].message.content;
    return answer;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
