import { readFile } from 'fs/promises';
import { extname, resolve } from 'path';
import { cwd } from 'process';
import { pathToFileURL } from 'url';
import { parse as parseJson } from 'json5';

/**
 * Lists file types supported by loadFile, by their extension.
 */
export enum FileType {
  JSON = 'json',
  JS = 'js',
  MJS = 'mjs'
  //TS = 'ts'
}

export namespace FileType {

  export const values: FileType[] = [FileType.JSON, FileType.JS, FileType.MJS];

  export function fromString(str: string): FileType | null {
    return values.find(type => type === str) ?? null;
  }
}

/**
 * Loads a file located at the given path, assuming it is of the given type.
 * 
 * @param path the path to load the file from
 * @param type file type; if this is not specified, `loadFile` will try to guess 
 * the file's type based on its extension.
 */
export async function loadFile<T = any>(path: string, type?: (FileType | string)): Promise<T> {
  const extension = extname(path).slice(1);
  if (type && !FileType.fromString(type)) {
    throw new Error(`Unsupported file type: ${type}. loadFiles supports only the following file types: ${FileType.values.join(', ')}`);
  }

  const fileType = (type as FileType) ?? FileType.fromString(extension);

  if (!fileType) {
    throw new Error('A type was not passed, and could not be determined from the file path.');
  }

  const resolvedPath = resolve(cwd(), path);

  switch (fileType) {
    case FileType.JSON: return parseJson(await readFile(resolvedPath, 'utf8'));
    case FileType.JS: return (await import(pathToFileURL(resolvedPath).toString())).default;
    case FileType.MJS: return (await import(pathToFileURL(resolvedPath).toString())).default;
  }
}