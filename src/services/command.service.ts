import type { Client, Message } from 'messenger-api.js';

export default class CommandService {
  private static commands = new Map<string, Function>();

  private constructor() {}

  public static command<T extends Function>(key: string, callback: T): void {
    CommandService.commands.set(key, callback);
  }

  public static isCommand(content: string): boolean {
    const keys = CommandService.commands.keys();

    for (const key of keys) {
      if (content.startsWith(key) && content.charAt(key.length).trim() === '') {
        return true;
      }
    }

    return false;
  }

  public static parseContent(content: string): ParsedContent | null {
    if (!CommandService.isCommand(content)) return null;

    const keys = CommandService.commands.keys();
    const matchedKeys: string[] = [];

    for (const key of keys) {
      if (content.startsWith(key)) {
        matchedKeys.push(key);
      }
    }

    const command = matchedKeys
      .sort((keyA, keyB) => keyB.length - keyA.length)
      .at(0)!;
    const args = content.slice(command.length + 1).split(' ');

    return {
      command,
      args,
    };
  }

  public static async processCommand(
    parsedContent: ParsedContent,
    client: Client,
    message: Message,
  ): Promise<void> {
    const callback = CommandService.commands.get(parsedContent.command);

    await Promise.resolve(callback?.(client, message, ...parsedContent.args));
  }
}

interface ParsedContent {
  command: string;
  args: string[];
}
