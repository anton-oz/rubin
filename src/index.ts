#!/usr/bin/env tsx

import { getModelName } from "@/logic/api/index";
import { gretaPrompt } from "@/logic/prompt";
import { createConvo, getLastConvo, isConvoEmpty } from "@/logic/filesystem";

const main = async () => {
  const modelName = await getModelName();
  const lastConvo = await getLastConvo();
  if (!lastConvo || !isConvoEmpty(lastConvo.path)) {
    await createConvo();
  } else {
    console.log(
      `\nResuming last convo: ${lastConvo.num} because it was empty.\n`,
    );
  }
  gretaPrompt(modelName);
};

main();
