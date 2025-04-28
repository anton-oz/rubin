#!/usr/bin/env tsx

import { getModelName } from "@/logic/api/index";
import { promptLoop } from "@/logic/prompt";
import { createConvo, getLastConvo, isConvoEmpty } from "@/logic/filesystem";

const main = async () => {
  console.clear();
  const modelName = await getModelName();
  const lastConvo = await getLastConvo();
  const isEmpty = lastConvo ? await isConvoEmpty(lastConvo.path) : undefined;
  // avoid creating unneccesary convos
  if (!lastConvo || !isEmpty) {
    await createConvo();
  } else {
    console.log(
      `Resuming last convo: ${lastConvo.num} because it was empty.`,
      `\nLocation: ${lastConvo.path}\n`,
    );
  }
  promptLoop(modelName);
};

main();
