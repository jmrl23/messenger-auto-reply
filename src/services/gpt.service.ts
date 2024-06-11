import OpenAi, { type ClientOptions } from 'openai';
import type { ChatModel } from 'openai/resources';

export default class GptService {
  private static instances: Map<string, GptService> = new Map();
  private conversation: Array<OpenAi.Chat.Completions.ChatCompletionMessageParam> =
    [];

  private constructor(
    private readonly id: string,
    private readonly openAi: OpenAi,
    private readonly model: ChatModel,
  ) {}

  public static async createInstance(
    id: string,
    clientOptions: ClientOptions,
    model: ChatModel,
  ): Promise<GptService> {
    const openAi = new OpenAi(clientOptions);
    const instance = new GptService(id, openAi, model);
    GptService.instances.set(id, instance);
    return instance;
  }

  public static getInstance(id: string): GptService | null {
    const instance = GptService.instances.get(id);
    if (!instance) return null;
    return instance;
  }

  public async sendMessage(
    payload: OpenAi.Chat.Completions.ChatCompletionMessageParam,
  ): Promise<string> {
    const response = await this.openAi.chat.completions.create({
      messages: [...this.conversation, payload],
      model: this.model,
    });
    const message = response.choices.at(0)?.message;
    if (message) this.conversation.push(payload, message);
    return message?.content ?? '';
  }
}
