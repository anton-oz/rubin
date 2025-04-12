import OpenAI from "openai";

const URL = "http://localhost:8000/v1";

const client = new OpenAI({
  baseURL: URL,
  apiKey: "somekey",
});

export const getModelName = async () => {
  const res = await fetch(`${URL}/models`);
  const { data } = await res.json();
  const name = data[0].id;
  return name;
};
