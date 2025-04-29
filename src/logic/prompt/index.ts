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

// TODO: change global functions to `function() {}` from `() => []`

/**
 * main prompt function, contains all logic neccesary for prompting
 * user via cli
 */
export const processQuery = async (
  query: string,
  modelName: string,
  rl: readline.Interface,
) => {
  if (isExitCommand(query)) {
    console.clear();
    process.exit(0);
  }
  if (isCommand(query)) {
    await processCommand(query, rl);
  }

  addQuestionToConvo(query);
  const history = convoState.getHistory();

  let answer;
  if (history.length > 1) {
    answer = await getAnswer(modelName, query, history);
  } else {
    answer = await getAnswer(modelName, query);
  }

  if (!answer) {
    console.error("ERROR: Answer does not exist\n");
    process.exit(1);
  }

  addAnswerToConvo(answer);

  const currentDirectory = convoState.getDir();
  const markdownFile = writeMarkdown(currentDirectory, answer);

  console.log("\n");
  await asyncBat(markdownFile);
  console.log("\n");

  return answer;
};
export const promptLoop = async (modelName: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      const question = await rl
        .question("Enter Question: ")
        .then((input) => input.trim());

      await processQuery(question, modelName, rl);
    }
  } finally {
    rl.close();
  }
};
