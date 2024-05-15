import fs from 'node:fs';

export default function isFileExists(path: string): boolean {
  const exists = fs.existsSync(path);

  return exists;
}
