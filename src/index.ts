import { getModelName } from "@/logic/api/index";
import { gretaPrompt } from "./logic/prompt";
import { createConvo } from "./logic/filesystem";

const main = async () => {
  const modelName = await getModelName();
  await createConvo();
  gretaPrompt(modelName);
};

main();
