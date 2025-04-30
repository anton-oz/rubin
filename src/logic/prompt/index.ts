import * as readline from "node:readline/promises";
import { getAnswer } from "../api";
import {
  isExitCommand,
  isCommand,
  processCommand,
  asyncBat,
} from "./resources";
import {
  writeMarkdown,
  addQuestionToConvo,
  addAnswerToConvo,
  convoState,
} from "../filesystem";
import { getTokensUsed } from "../api/resources";

/**
 * main prompt function, contains all logic neccesary for prompting
 * user via cli
 */
async function processQuery(
  query: string,
  modelName: string,
  rl: readline.Interface,
) {
  if (isExitCommand(query)) {
    console.clear();
    process.exit(0);
  }
  if (isCommand(query)) {
    await processCommand(query, rl);
    return;
  }

  addQuestionToConvo(query);
  const history = convoState.getHistory();

  const answer = await getAnswer(modelName, query, history);

  if (!answer) {
    console.error("ERROR: Answer does not exist\n");
    process.exit(1);
  }

  addAnswerToConvo(answer);

  const currentDirectory = convoState.getDir();
  const markdownFile = writeMarkdown(currentDirectory, answer);

  await asyncBat(markdownFile);
  console.log("");

  await getTokensUsed(modelName, history);
  return answer;
}

export async function promptLoop(modelName: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      const question = await rl
        .question("Enter Question: ")
        .then((input) => input.trim());
      // reprompt on empty input
      if (question === "") continue;
      await processQuery(question, modelName, rl);
    }
  } finally {
    rl.close();
  }
}
