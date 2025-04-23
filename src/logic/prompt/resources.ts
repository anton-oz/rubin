import * as readline from "node:readline/promises";
import {
  switchConvo,
  createConvo,
  convoState,
  isConvoEmpty,
} from "../filesystem";
import { spawn } from "child_process";

/**
 * function for prompting user
 */
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * commands that lead to exit.
 */
export type ExitCommand = "q" | "quit" | "exit";
export const exitCommands = new Set<ExitCommand>(["q", "quit", "exit"]);

/**
 * check if command leads to exit
 */
export const isExitCommand = (input: string): input is ExitCommand => {
  return exitCommands.has(input as ExitCommand);
};

export const showHelp = () => {
  // prettier-ignore
  console.log(
    "\n" +
    "'h', 'help' -- display this help menu\n" +
    "'exit', 'q' -- quit program\n" +
    "commands: \n" +
    "  file -- enter file path for greta to read\n" +
    "  new -- create a new conversation\n" +
    "  clear -- clear the screen\n"
   );
};
/**
 * available commands
 */
export type Command = "h" | "help" | "switch" | "file" | "new" | "clear";
export const commands = new Set<Command>([
  "h",
  "help",
  "switch",
  "file",
  "new",
  "clear",
]);
/**
 * check if command is available
 */
export const isCommand = (input: string): input is Command => {
  return commands.has(input as Command);
};

/**
 * if command matches a case do the thing and continue the prompt loop
 */
export const processCommand = async (command: Command) => {
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
    case "new":
      const currentConvo = convoState.getDir();
      const empty = await isConvoEmpty(`${currentConvo}/convo.json`);
      if (empty) {
        console.log(
          "\nYour current convo is empty, not creating a new convo\n",
        );
        break;
      }
      await createConvo();
      break;
    case "clear":
      console.clear();
      break;
    default:
      break;
  }
};

/**
 * waits for user to stop paging before continuing prompt loop
 *
 * @param file - file to display/page with bat
 */
export const asyncBat = (file: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const bat = spawn("bat", ["-p", "--file-name markdown", file], {
      // dont record any keypresses when paging with bat
      stdio: [null, "inherit", null],
      shell: true,
    });

    bat.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
};
