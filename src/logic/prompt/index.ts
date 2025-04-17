import * as readline from "node:readline/promises";
import { getAnswer } from "../api";

type ExitCommand = "q" | "quit" | "exit";
const exitCommands = new Set<ExitCommand>(["q", "quit", "exit"]);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const isExitCommand = (input: string): input is ExitCommand => {
  return exitCommands.has(input as ExitCommand);
};

export const gretaPrompt = async (modelName: string) => {
  const question = await rl.question("Enter Question: ");
  if (isExitCommand(question)) {
    process.exit(0);
  }
  const answer = await getAnswer(modelName, question);
  console.log(`\n${answer}\n`);
};
