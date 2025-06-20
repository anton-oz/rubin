import { spawn } from "child_process";
import * as readline from "node:readline/promises";
import {
  switchConvo,
  createConvo,
  isConvoEmpty,
  convoState,
} from "@/logic/filesystem";

/**
 * function for prompting user
 */

/**
 * commands that lead to exit.
 */
export type ExitCommand = "q" | "quit" | "exit";
export const exitCommands = new Set<ExitCommand>(["q", "quit", "exit"]);

/**
 * check if command leads to exit
 */
export function isExitCommand(input: string): input is ExitCommand {
  return exitCommands.has(input as ExitCommand);
}

// TODO: update help commands
export function showHelp() {
  // prettier-ignore
  console.log(
    "\n" +
    "'h', 'help'    display this help menu\n" +
    "'exit', 'q'    quit program\n" +
    "commands: \n" +
    "  file\n    enter file path to read\n" +
    "  new\n    create a new conversation\n" +
    "  clear\n    clear the screen\n"
   );
}
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
export function isCommand(input: string): input is Command {
  return commands.has(input as Command);
}

/**
 * if command matches a case do the thing and continue the prompt loop
 */
export async function processCommand(command: Command, rl: readline.Interface) {
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
          "\nError: Your current convo is empty, not creating a new convo\n",
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
}

/**
 * BUG:
 * this input is not sanitized, got to find a way to santize the
 * arguments sent to child process
 */
/**
 * waits for user to stop paging before continuing prompt loop
 *
 * @param file - file to display/page with bat
 */
export async function asyncBat(file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // HACK: not the best way to sanitize, but works for now
    const sanitizedArgs = `bat -p --file-name markdown ${file.replace(/(["\s'$`\\])/g, "\\$1")}`;
    const bat = spawn(sanitizedArgs, {
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
}
