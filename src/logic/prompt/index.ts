import * as readline from "node:readline/promises";
import { getAnswer } from "@/logic/api";
import { addToConvo, convoState, switchConvo } from "@/logic/filesystem";

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

const showHelp = () => {
  // prettier-ignore
  console.log(
    "\n" +
    "'h', 'help' -- display this help menu\n" +
    "'exit', 'q' -- quit program\n" +
    "commands: \n" +
    "  file -- enter file path for greta to read\n" +
    "  new -- create a new conversation\n" +
    "\n"
  )
};
/**
 * available commands
 */
type Command = "h" | "help" | "switch" | "file" | "new";
const commands = new Set<Command>(["h", "help", "switch", "file", "new"]);
/**
 * check if command is available
 */
const isCommand = (input: string): input is Command => {
  return commands.has(input as Command);
};

/**
 * if command matches a case do the thing and continue the prompt loop
 */
const processCommand = async (command: Command) => {
  switch (command) {
    case "h":
    case "help":
      showHelp();
      break;
    case "switch":
      const input = await rl.question("Enter convo num: ");
      const convoNum = parseInt(input);
      await switchConvo(convoNum);
      break;
    default:
      break;
  }
};

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
      process.exit(0);
    }
    if (isCommand(question)) {
      await processCommand(question);
      continue;
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
  }
};
