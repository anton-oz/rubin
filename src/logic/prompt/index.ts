import { getAnswer } from "@/logic/api";
import {
  addAnswerToConvo,
  addQuestionToConvo,
  convoState,
  writeMarkdown,
} from "@/logic/filesystem";
import {
  rl,
  isExitCommand,
  isCommand,
  processCommand,
  asyncBat,
} from "./resources";

/**
 * main prompt function, contains all logic neccesary for prompting
 * user via cli
 */
export const gretaPrompt = async (modelName: string) => {
  while (true) {
    const question = await rl
      .question("Enter Question: ")
      .then((input) => input.trim());

    if (isExitCommand(question)) {
      console.clear();
      process.exit(0);
    }
    if (isCommand(question)) {
      await processCommand(question);
      continue;
    }

    addQuestionToConvo(question);
    const history = convoState.getHistory();

    let answer;
    if (history.length > 1) {
      answer = await getAnswer(modelName, question, history);
    } else {
      answer = await getAnswer(modelName, question);
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
  }
};
