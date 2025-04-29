import OpenAI from "openai";
import path from "path";
import { convosDir, currentDateDir, dirArray } from "./resources";

export class ConvoState {
  private dateDir: string;
  private dir: string;
  private num: number;
  private history: OpenAI.ChatCompletionMessageParam[];

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
    this.dir = path.resolve(dir);
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
  setHistory(history: OpenAI.ChatCompletionMessageParam[]) {
    this.history = history;
  }
}
