import OpenAI from "openai";
import { baseURL } from "./resources";
import { ChatCompletionMessageParam } from "openai/src/resources.js";
import { ChatCompletionUserMessageParam } from "openai/resources.mjs";

const client = new OpenAI({
  baseURL,
  apiKey: "nothing",
});

/**
 * checks the url given for baseURL and returns the first model at that url.
 */
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
    });

    const answer = response.choices[0].message.content;
    return answer;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
