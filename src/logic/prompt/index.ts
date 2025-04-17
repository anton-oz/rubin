import * as readline from "node:readline/promises";
import { getAnswer } from "../api";
import { addToConvo, convoState } from "../filesystem";

/**
 * function for prompting user
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * commands that lead to exit.
 */
type ExitCommand = "q" | "quit" | "exit";
const exitCommands = new Set<ExitCommand>(["q", "quit", "exit"]);

/**
 * check if command leads to exit
 */
const isExitCommand = (input: string): input is ExitCommand => {
  return exitCommands.has(input as ExitCommand);
};

/**
 * if command matches a case do the thing and continue the prompt loop
 */
const isCommand = async (command: string) => {
  switch (command) {
    case "switch":
      const convoNum = rl.question("Enter convo num: ");
  }
};

/**
 * main prompt function, contains all logic neccesary for prompting
 * user via cli
 */
export const gretaPrompt = async (modelName: string) => {
  const question = await rl.question("Enter Question: ");
  if (isExitCommand(question)) {
    process.exit(0);
  }
  const history = convoState.getHistory();
  let answer;
  if (history.length > 1) {
    answer = await getAnswer(modelName, question, history);
  } else {
    answer = await getAnswer(modelName, question);
  }
  if (!answer) {
    console.error("Ran into problem with answer");
    process.exit(1);
  }
  addToConvo(question, answer);
  console.log(`\n${answer}\n`);
};
