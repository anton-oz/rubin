#!/usr/bin/env tsx

import { getModelName } from "@/logic/api/index";
import { promptLoop } from "@/logic/prompt";
import {
  addSystemPromptToConvo,
  createConvo,
  getLastConvo,
  isConvoEmpty,
} from "@/logic/filesystem";

async function main() {
  console.clear();
  const modelName = await getModelName();
  const lastConvo = await getLastConvo();
  const isEmpty = lastConvo ? await isConvoEmpty(lastConvo.path) : undefined;
  // avoid creating unneccesary convos
  if (!lastConvo || !isEmpty) {
    await createConvo();
    addSystemPromptToConvo();
  } else {
    console.log(
      `Resuming last convo: ${lastConvo.num} because it was empty.`,
      `\nLocation: ${lastConvo.path}\n`,
    );
  }
  promptLoop(modelName);
}

main();
