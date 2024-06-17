import OpenAi, { type ClientOptions } from 'openai';

export default class GptService {
  private static readonly instances: Map<string, GptService> = new Map();
  private conversation: Array<OpenAi.Chat.Completions.ChatCompletionMessageParam> =
    [];

  private constructor(
    private readonly openAi: OpenAi,
    private readonly model: OpenAi.Chat.ChatModel,
    private readonly maxRetries: number,
  ) {
    if (maxRetries < 1) {
      throw new GptError('[GPT Error]: `maxRetries` must be greater than 0.');
    }
  }

  public static getInstance(id: string): GptService | null {
    return GptService.instances.get(id) ?? null;
  }

  public static registerInstance(id: string, gptService: GptService): void {
    GptService.instances.set(id, gptService);
  }

  public static async createInstance(
    clientOptions: ClientOptions & {
      model?: OpenAi.Chat.ChatModel;
      maxRetries?: number;
    },
  ): Promise<GptService> {
    const { model, maxRetries, ...rest } = clientOptions;
    const openAi = new OpenAi(rest);
    const instance = new GptService(
      openAi,
      model ?? 'gpt-3.5-turbo',
      Math.floor(maxRetries ?? 3),
    );
    return instance;
  }

  public async send(
    payload: OpenAi.Chat.Completions.ChatCompletionMessageParam & {
      // do not set manually when sending message
      __retries?: number;
    },
  ): Promise<string> {
    const { __retries: r, ...rest } = payload;
    const retries = r ?? 0;
    const response = await this.openAi.chat.completions.create({
      messages: [...this.conversation, payload],
      model: this.model,
    });
    const message = response.choices?.at(0)?.message;
    const content = message?.content;
    if (!message || (!content && retries < this.maxRetries)) {
      return await this.send({ ...rest, __retries: retries + 1 });
    }
    if (retries >= this.maxRetries) {
      throw new GptError('[GPT Error]: GPT did not respond to your message.');
    }
    this.conversation.push(rest, message);
    return message.content!;
  }
}

class GptError extends Error {
  constructor(public readonly message: string) {
    super(message);
  }
}
