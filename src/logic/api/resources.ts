import OpenAI from "openai";

/**
 * TODO:
 * get this value from a env variable
 * but default to this value
 */
export const baseURL = "http://localhost:8000/v1";

export async function getTokensUsed(
  model: string,
  history: OpenAI.ChatCompletionMessageParam[],
) {
  const body = {
    model,
    prompt: JSON.stringify(history),
    add_special_tokens: true,
    additionalProp1: {},
  };
  const opts = {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = await fetch(`http://localhost:8000/tokenize`, opts);
  const { tokens } = await response.json();
  console.log(`Tokens used so far: ${tokens.length}`);
}
