import path from "path";
import { fileURLToPath } from "url";
import { promises as fsp } from "fs";
import fs from "fs";

/**
 * NOTE:
 * commonly used filepaths
 */
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const rootPath = path.resolve(__dirname, "../../../");
export const srcPath = path.normalize(`${rootPath}/src`);
export const convosDir = path.normalize(`${rootPath}/convos`);

const dateOptions: Intl.DateTimeFormatOptions = {
  month: "2-digit",
  day: "2-digit",
  year: "2-digit",
};
const currentDate = new Date()
  .toLocaleDateString("en-US", dateOptions)
  .replaceAll("/", "_");

export const currentDateDir = path.normalize(`${convosDir}/${currentDate}`);

// NOTE: functions for manipulating/reading dirs
/**
 * ASYNC! returns array of directories in dirPath
 */
export const dirArray = async (dirPath: string): Promise<string[]> => {
  try {
    const files = await fsp.readdir(dirPath);
    return files.map((file) => file.toString());
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
};

/**
 * check if directory exists
 */
export const dirExists = (dirPath: string) => {
  return fs.existsSync(dirPath);
};

/**
 * ASYNC! create directory at dirPath
 */
export const createDir = async (dirPath: string) => {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
    return;
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
};
