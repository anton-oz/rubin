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
import { ConvoState } from "./convoState";
import OpenAI from "openai";

if (!fileExists(convosDir)) {
  await createDir(convosDir);
}

if (!fileExists(currentDateDir)) {
  await createDir(currentDateDir);
}

export const convoState = await ConvoState.init();

export async function isConvoEmpty(filePath: string): Promise<boolean> {
  const convo = await readAndParseJson(filePath);
  // NOTE: changed to one for system prompt
  if (convo.length === 0 || convo[0].role === "system") {
    return true;
  } else {
    return false;
  }
}

export async function getLastConvo() {
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
}

export async function addSystemPromptToConvo(systemPrompt?: string) {
  const prompt: OpenAI.ChatCompletionSystemMessageParam = {
    role: "system",
    content:
      `Your name is Rubin, a helpful, calm, zen, vibe assistant. ` +
      `The current date and time is ${new Date()}. ` +
      `You answer questions concisely, simply, and elegantly. ` +
      `Use only the tools that have been supplied to you.`,
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
}

export async function createConvo() {
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

  addSystemPromptToConvo();

  console.log(`Current convo: ${newConvoNum}`);
  console.log(`Location: ${newConvoDir}`);
  console.log("---");
}

export async function addQuestionToConvo(questionContent: string) {
  const question: OpenAI.ChatCompletionUserMessageParam = {
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
}

export async function addAnswerToConvo(answerContent: string) {
  const answer: OpenAI.ChatCompletionAssistantMessageParam = {
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
}

export function writeMarkdown(filePath: string, content: string) {
  fs.writeFile(`${filePath}/last_answer.md`, content, (err) => {
    if (err) throw err;
  });
  return `${filePath}/last_answer.md`;
}

/**
 * doesnt yet switch the date dir, but for the current date will switch
 * the current conversation.
 */
export async function switchConvo(convoNum: number) {
  const currentDateDir = convoState.getDateDir();

  const convos = await dirArray(currentDateDir);
  if (convoNum > convos.length) {
    console.error("\nError: That conversation does not exist.\n");
    return;
  }

  convoState.setNum(convoNum);
  convoState.setDir(`${currentDateDir}/${convoNum.toString()}`);

  const currentConvo = convoState.getDir();
  const convoJsonPath = `${currentConvo}/convo.json`;
  const history = await readAndParseJson(convoJsonPath);

  convoState.setHistory(history);
  console.log(`current convo: ${currentConvo}\n` + "---");
}
