import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  convosDir,
  dirExists,
  createDir,
  currentDateDir,
  dirArray,
} from "./resources";
import { ChatCompletionUserMessageParam } from "openai/resources.mjs";

if (!dirExists(convosDir)) {
  await createDir(convosDir);
}

if (!dirExists(currentDateDir)) {
  await createDir(currentDateDir);
}

class ConvoState {
  private dateDir: string;
  private dir: string;
  private num: number;
  private history: ChatCompletionUserMessageParam[];

  constructor(num: number) {
    this.num = num;
    this.dateDir = currentDateDir;
    this.dir = `${currentDateDir}/${this.num}`;
    this.history = [];
  }

  static async init() {
    const convoArr = await dirArray(currentDateDir);
    const convoNum = convoArr.length;
    return new ConvoState(convoNum);
  }

  setDateDir(date: string) {
    this.dateDir = path.normalize(`${convosDir}/${date}`);
  }
  getDateDir() {
    return this.dateDir;
  }

  setDir(dir: string) {
    this.dir = dir;
  }
  getDir() {
    return this.dir;
  }

  setNum(num: number) {
    this.num = num;
  }
  getNum() {
    return this.num;
  }

  getHistory() {
    return this.history;
  }
}

const convoState = await ConvoState.init();

export const createConvo = async () => {
  const currentDateDir = convoState.getDateDir();
  const convos = await dirArray(currentDateDir);

  const newConvoNum = convos.length + 1;
  const newConvoDir = path.normalize(`${currentDateDir}/${newConvoNum}`);
  createDir(newConvoDir);
  convoState.setNum(newConvoNum);
  convoState.setDir(newConvoDir);

  console.log(`Current convo: ${newConvoNum}`);
  console.log(`Location ${newConvoDir}`);
  console.log("---");
};
