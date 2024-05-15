import fs from 'node:fs/promises';
import isFileExists from './isFileExists';

export default async function readFile(path: string): Promise<string> {
  if (!isFileExists(path)) throw new Error(`File not found: ${path}`);

  const data = await fs.readFile(path, {
    encoding: 'utf-8',
  });

  return data;
}
