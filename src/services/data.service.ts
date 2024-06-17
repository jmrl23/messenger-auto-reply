import { MODE } from '../constants/data.constant';
import { DATA_PATH } from '../constants/paths.constant';
import isFileExists from '../utils/isFileExists';
import readJsonFile from '../utils/readJsonFile';
import writeJsonFile from '../utils/writeJsonFile';

export default class DataService {
  private static readonly dataPath = DATA_PATH;

  private constructor() {}

  public static async initialize(): Promise<void> {
    if (!isFileExists(DataService.dataPath)) {
      await writeJsonFile(DataService.dataPath, {
        active: true,
        mode: MODE.Offline,
        ignore: [],
      } satisfies AppData);
    }
  }

  public static async getData(): Promise<AppData> {
    const data = await readJsonFile<AppData>(DataService.dataPath);

    return data;
  }

  public static async set(
    key: keyof AppData,
    value: AppData[typeof key],
  ): Promise<AppData> {
    const data = await DataService.getData();

    // @ts-expect-error
    data[key] = value;

    await writeJsonFile(DataService.dataPath, data);

    return data;
  }

  public static async get<T extends keyof AppData>(
    key: T,
  ): Promise<AppData[T]> {
    const data = await DataService.getData();
    const value = data[key];

    return value;
  }
}

interface AppData {
  active: boolean;
  mode: MODE;
  ignore: string[];
}
