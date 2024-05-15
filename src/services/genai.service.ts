import {
  type ChatSession,
  type StartChatParams,
  GoogleGenerativeAI,
} from '@google/generative-ai';

export default class GenAiService {
  private static readonly instances = new Map<string, GenAiService>();

  private constructor(
    private readonly id: string,
    private readonly chatSession: ChatSession,
  ) {
    GenAiService.instances.set(this.id, this);
  }

  public static async createInstance(
    id: string,
    apiKey: string,
    model: string,
    startChatParams?: StartChatParams,
  ): Promise<GenAiService> {
    const genAi = new GoogleGenerativeAI(apiKey);
    const genAiModel = genAi.getGenerativeModel({ model });
    const chatSession = genAiModel.startChat(startChatParams);
    const instance = new GenAiService(id, chatSession);

    return instance;
  }

  public static getInstanceById(id: string): GenAiService | null {
    const instance = this.instances.get(id);

    return instance ?? null;
  }

  public sendMessage = this.chatSession.sendMessage.bind(this.chatSession);

  public sendMessageStream = this.chatSession.sendMessageStream.bind(
    this.chatSession,
  );

  public getHistory = this.chatSession.getHistory.bind(this.chatSession);

  public getChatSession(): ChatSession {
    return this.chatSession;
  }
}
