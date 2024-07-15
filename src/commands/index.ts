/**
 * message your own account to
 * execute commands
 */

import fs from 'node:fs/promises';
import path from 'node:path';

async function autoload(): Promise<void> {
  const files = await fs.readdir(__dirname);
  const isCommand = (path: string) => /\.command\.(ts|js)$/i.test(path);
  const commands = files.filter(isCommand);
  const cleanImport = (file: string) => import(path.resolve(__dirname, file));

  void Promise.all(commands.map(cleanImport));
}

void autoload();
