import path from "path";
import fs from "fs";
import {
  convosDir,
  fileExists,
  createDir,
  currentDateDir,
  dirArray,
  readAndParseJson,
} from "./resources";
import {
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionSystemMessageParam,
} from "openai/resources.mjs";
import { ChatCompletionAssistantMessageParam } from "openai/src/resources.js";

if (!fileExists(convosDir)) {
  await createDir(convosDir);
}

if (!fileExists(currentDateDir)) {
  await createDir(currentDateDir);
}

class ConvoState {
  private dateDir: string;
  private dir: string;
  private num: number;
  private history: ChatCompletionMessageParam[];

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
  setHistory(history: ChatCompletionMessageParam[]) {
    this.history = history;
  }
}

export const convoState = await ConvoState.init();

export const isConvoEmpty = async (filePath: string): Promise<boolean> => {
  const convo = await readAndParseJson(filePath);
  if (convo.length === 0) {
    return true;
  } else {
    return false;
  }
};

export const getLastConvo = async () => {
  const currentDateDir = convoState.getDateDir();
  const convos = await dirArray(currentDateDir);

  if (convos.length === 0) {
    return;
  }
  const lastConvoPath = `${currentDateDir}/${convos.length}/convo.json`;

  const lastConvo = {
    path: lastConvoPath,
    num: convos.length,
  };

  return lastConvo;
};

export const createConvo = async () => {
  const currentDateDir = convoState.getDateDir();
  const convos = await dirArray(currentDateDir);

  const newConvoNum = convos.length + 1;
  const newConvoDir = path.normalize(`${currentDateDir}/${newConvoNum}`);
  await createDir(newConvoDir);
  convoState.setNum(newConvoNum);
  convoState.setDir(newConvoDir);
  convoState.setHistory([]);

  // init a convo.json to prevent errors when switching conversations
  fs.writeFile(`${newConvoDir}/convo.json`, "[]", (err) => {
    if (err) throw err;
  });

  console.log(`Current convo: ${newConvoNum}`);
  console.log(`Location: ${newConvoDir}`);
  console.log("---");
};

export const addSystemPromptToConvo = (systemPrompt?: string) => {
  const prompt: ChatCompletionSystemMessageParam = {
    role: "system",
    content:
      `Your name is Rubin, a helpful, calm, zen, vibe assistant. ` +
      `The current date and time is ${new Date()}. ` +
      `You only have access to the tools provided to you, ` +
      `and will supply the parameters from your own memory unless otherwise prompted. ` +
      `You answer questions in an accurate and concise manner, being accurate as a first priority.`,
  };
  if (systemPrompt) {
    prompt.content += systemPrompt;
  }

  const convoDir = convoState.getDir();
  const convoJsonPath = `${convoDir}/convo.json`;
  const convoArr = convoState.getHistory();

  convoArr.push(prompt);
  convoState.setHistory(convoArr);

  fs.writeFile(convoJsonPath, JSON.stringify(convoArr), (err) => {
    if (err) throw err;
  });
};

export const addQuestionToConvo = (questionContent: string) => {
  const question: ChatCompletionUserMessageParam = {
    role: "user",
    content: questionContent,
  };

  const convoDir = convoState.getDir();
  const convoJsonPath = `${convoDir}/convo.json`;
  const convoArr = convoState.getHistory();

  convoArr.push(question);
  convoState.setHistory(convoArr);

  fs.writeFile(convoJsonPath, JSON.stringify(convoArr), (err) => {
    if (err) throw err;
  });
};

export const addAnswerToConvo = (answerContent: string) => {
  const answer: ChatCompletionAssistantMessageParam = {
    role: "assistant",
    content: answerContent,
  };

  const convoDir = convoState.getDir();
  const convoJsonPath = `${convoDir}/convo.json`;
  const convoArr = convoState.getHistory();

  convoArr.push(answer);
  convoState.setHistory(convoArr);

  fs.writeFile(convoJsonPath, JSON.stringify(convoArr), (err) => {
    if (err) throw err;
  });
};

export const writeMarkdown = (filePath: string, content: string) => {
  fs.writeFile(`${filePath}/last_answer.md`, content, (err) => {
    if (err) throw err;
  });
  return `${filePath}/last_answer.md`;
};

/**
 * doesnt yet switch the date dir, but for the current date will switch
 * the current conversation.
 */
export const switchConvo = async (convoNum: number) => {
  const currentDateDir = convoState.getDateDir();

  const convos = await dirArray(currentDateDir);
  if (convoNum > convos.length) {
    console.log("\nThat conversation does not exist.\n");
    return;
  }

  convoState.setNum(convoNum);
  convoState.setDir(`${currentDateDir}/${convoNum.toString()}`);

  const currentConvo = convoState.getDir();
  const convoJsonPath = `${currentConvo}/convo.json`;
  const history = await readAndParseJson(convoJsonPath);

  convoState.setHistory(history);
  console.log(`current convo: ${currentConvo}\n` + "---");
};
