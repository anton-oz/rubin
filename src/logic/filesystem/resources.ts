import path from "path";
import { fileURLToPath } from "url";
import { promises as fsp } from "fs";
import fs from "fs";

/**
 * NOTE:
 * commonly used filepaths
 * BUG:
 * does not resolve in build
 * defaults to the home directory when installed globally
 * TODO:
 * setup env variable for convo path
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
export async function dirArray(dirPath: string): Promise<string[]> {
  try {
    const files = await fsp.readdir(dirPath);
    return files.map((file) => file.toString());
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
}

/**
 * check if directory exists
 */
export function fileExists(dirPath: string) {
  return fs.existsSync(dirPath);
}

/**
 * ASYNC! create directory at dirPath
 */
export async function createDir(dirPath: string) {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
    return;
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
}

/**
 * ASYNC! Read and return parsed json file
 */
export async function readAndParseJson(filePath: string) {
  try {
    const content = await fsp.readFile(filePath, { encoding: "utf-8" });
    return JSON.parse(content);
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
}
