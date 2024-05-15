import fs from 'node:fs/promises';

export default async function writeJsonFile(
  path: string,
  data: object,
): Promise<void> {
  const stringifiedData = JSON.stringify(data);

  await fs.writeFile(path, stringifiedData, {
    encoding: 'utf-8',
  });
}
