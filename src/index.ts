import * as readline from "node:readline/promises";
import { getModelName } from "./logic/api/index.ts";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = async () => {
  getModelName();

  while (true) {
    const question = await rl.question("Enter Question: ");
    console.log(question);
  }
};

main();
