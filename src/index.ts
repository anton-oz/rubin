#!/usr/bin/env tsx

import { getModelName } from "@/logic/api/index";
import { gretaPrompt } from "@/logic/prompt";
import {
  createConvo,
  getLastConvoPath,
  isConvoEmpty,
} from "@/logic/filesystem";

const main = async () => {
  const modelName = await getModelName();
  const lastConvo = await getLastConvoPath();
  if (!lastConvo || !isConvoEmpty(lastConvo)) {
    await createConvo();
  }
  gretaPrompt(modelName);
};

main();
