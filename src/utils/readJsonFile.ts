import readFile from './readFile';

export default async function readJsonFile<T extends object>(
  path: string,
): Promise<T> {
  const data = await readFile(path);
  const jsonData = JSON.parse(data) as T;

  return jsonData;
}
