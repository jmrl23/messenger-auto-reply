import OpenAi, { type ClientOptions } from 'openai';
import { encoding_for_model as encodingForModel } from 'tiktoken';

export default class GptService {
  private static readonly instances: Map<string, GptService> = new Map();
  private readonly conversation: Array<OpenAi.Chat.Completions.ChatCompletionMessageParam> =
    [];
  private readonly memoryMaxToken: number = 400;
  private readonly memoryPrompt: string = `
    Forget all previous instructions. 
    Summarize our conversation, only include 
    user and assistant's; your point of view 
    is you are the assistant; fix typos if 
    there are any; minimize the risk of losing 
    the contents' sense; remember details 
    about the user such as their preferences, 
    name, etc.
    Here is an example format, strictly follow:

    [
      {
        "role": "assistant",
        "content": "<shorter version>"
      },
      {
        "role": "user",
        "content": "<shorter version>"
      }
    ]
  `.trim();

  private constructor(
    private readonly openAi: OpenAi,
    private readonly model: OpenAi.Chat.ChatModel,
    private readonly maxRetries: number,
    private readonly maxTokens: number,
    private readonly initialPrompt?: string,
  ) {
    if (maxRetries < 1) {
      throw new GptError('[GPT Error]: `maxRetries` must be greater than 0.');
    }
    if (maxTokens < 1000) {
      throw new GptError('[GPT Error]: `maxTokens` must be at least 1000.');
    }
  }

  public static async createInstance(
    clientOptions: ClientOptions & {
      model?: OpenAi.Chat.ChatModel;
      maxRetries?: number;
      maxtokens?: number;
      initialPrompt?: string;
    },
  ): Promise<GptService> {
    const { model, maxRetries, maxtokens, initialPrompt, ...rest } =
      clientOptions;
    const openAi = new OpenAi({ ...rest, maxRetries });
    const instance = new GptService(
      openAi,
      model ?? 'gpt-3.5-turbo',
      Math.floor(maxRetries ?? 3),
      maxtokens ?? 4_096, // gpt-3.5-turbo's default max tokens
      initialPrompt,
    );
    if (initialPrompt) {
      await instance.send({
        role: 'system',
        content: initialPrompt,
      });
    }
    return instance;
  }

  public static getInstance(id: string): GptService | null {
    return GptService.instances.get(id) ?? null;
  }

  public static registerInstance(id: string, gptService: GptService): void {
    GptService.instances.set(id, gptService);
  }

  public async fixMemory(): Promise<void> {
    try {
      const response = await this.openAi.chat.completions.create({
        max_tokens: this.memoryMaxToken,
        model: this.model,
        messages: [
          ...this.conversation,
          {
            role: 'system',
            content: this.memoryPrompt,
          },
        ],
      });
      const content = response.choices.at(0)?.message.content;
      const conversation = JSON.parse(content ?? '[]');
      this.conversation.splice(0, this.conversation.length);
      if (this.initialPrompt) {
        await this.send({
          role: 'system',
          content: this.initialPrompt,
        });
      }
      this.conversation.push(...conversation);
    } catch (error) {
      // just delete half of the conversation 'cause we need more tokens 😈
      this.conversation.splice(1, Math.floor(this.conversation.length / 2));
    }
  }

  public async send(
    payload: OpenAi.Chat.Completions.ChatCompletionMessageParam & {
      // do not set manually when sending message
      __retries?: number;
      __save?: boolean;
    },
  ): Promise<string> {
    const { __retries: r, __save: s, ...rest } = payload;
    const retries = r ?? 0;
    const save = s === true || s === undefined;
    if (
      this.getTokensCount(this.memoryPrompt) +
        this.getConversationTokensTotalCount() +
        this.memoryMaxToken >
      this.maxTokens
    ) {
      await this.fixMemory();
    }
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
    if (save) this.conversation.push(rest, message);
    return message.content!;
  }

  public getConversation(): Array<OpenAi.Chat.Completions.ChatCompletionMessageParam> {
    return JSON.parse(JSON.stringify(this.conversation));
  }

  public getConversationTokens(): Uint32Array[] {
    const conversation = this.getConversation();
    const tokens = conversation.map((message) =>
      this.getTokens(message.content as string),
    );
    return tokens;
  }

  public getConversationTokensCounts(): number[] {
    const conversation = this.getConversation();
    const counts = conversation.map((message) =>
      this.getTokensCount(message.content as string),
    );
    return counts;
  }

  public getConversationTokensTotalCount(): number {
    const counts = this.getConversationTokensCounts();
    const total = counts.reduce<number>((total, value) => (total += value), 0);
    return total;
  }

  private getTokens(input: string): Uint32Array {
    const encoding = encodingForModel(this.model);
    const tokens = encoding.encode(input);
    encoding.free();
    return tokens;
  }

  private getTokensCount(input: string): number {
    const tokens = this.getTokens(input);
    const count = tokens.length;
    return count;
  }
}

class GptError extends Error {
  constructor(public readonly message: string) {
    super(message);
  }
}
