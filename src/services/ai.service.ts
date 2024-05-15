import { GEN_AI_API_KEY } from '../constants/environment.constant';
import GenAiService from './genai.service';

export default class AiService {
  private constructor(
    private readonly id: string,
    private genAiService: GenAiService,
  ) {}

  public static async createInstance(id: string): Promise<AiService> {
    const genAiService =
      GenAiService.getInstanceById(id) ??
      (await AiService.createGenAiInstance(id));
    const instance = new AiService(id, genAiService);

    return instance;
  }

  public async sendMessage(message: string): Promise<string> {
    try {
      const data = await this.genAiService.sendMessage(message);
      const text = data.response.text();

      return text;
    } catch (error) {
      this.genAiService = await AiService.createGenAiInstance(this.id);

      if (error instanceof Error) {
        return error.message;
      }

      return '[AiServiceError]: unknown';
    }
  }

  private static async createGenAiInstance(id: string): Promise<GenAiService> {
    const genAiService = await GenAiService.createInstance(
      id,
      GEN_AI_API_KEY,
      'gemini-pro',
    );

    return genAiService;
  }
}
