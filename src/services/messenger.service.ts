import type { Client, Message, User } from 'messenger-api.js';
import { MODE } from '../constants/data.constant';
import DataService from './data.service';
import CommandService from './command.service';
import TemplateService from './template.service';
import AiService from './ai.service';
import ent from 'ent';

export default class MessengerService {
  private constructor() {}

  public static async processMessage(
    client: Client,
    message: Message,
  ): Promise<void> {
    if (message.isClientUser && message.threadId === message.authorId) {
      if (CommandService.isCommand(message.content)) {
        const parsedContent = CommandService.parseContent(message.content);

        if (parsedContent) {
          await CommandService.processCommand(parsedContent, client, message);
        }
      }

      return;
    }

    const ignore = await MessengerService.isIgnoredMessage(client, message);

    if (ignore) return;

    const mode = await DataService.get('mode');

    await this.sendResponse(mode, message);
  }

  private static async isIgnoredMessage(
    client: Client,
    message: Message,
  ): Promise<boolean> {
    const appData = await DataService.getData();
    const conditions = [
      !appData.active,
      message.content.length < 1,
      message.thread.isGroup,
      message.threadId === client.user?.id,
      message.isClientUser,
      await MessengerService.isIgnoredUser(message.author),
    ];

    const isIgnored = conditions.includes(true);

    return isIgnored;
  }

  private static async isIgnoredUser(user: User): Promise<boolean> {
    const ignoreList = await DataService.get('ignore');
    const userProps = [
      user.id,
      user.shortName,
      user.alternateName,
      user.username,
      user.profileUrl,
    ];

    for (const value of ignoreList) {
      if (
        userProps.some((item) => item.toLowerCase() === value.toLowerCase())
      ) {
        return true;
      }
    }

    return false;
  }

  private static async sendResponse(
    mode: MODE,
    message: Message,
  ): Promise<void> {
    const templates = new Map<MODE, string>([
      [MODE.Ai, 'ai'],
      [MODE.Busy, 'busy'],
      [MODE.Offline, 'offline'],
    ]);

    const template = templates.get(mode);

    if (!template) return;

    const extras: Record<string, unknown> = {};

    switch (mode) {
      case MODE.Ai:
        const aiService = await AiService.createInstance(message.threadId);

        extras.ai = await aiService.sendMessage(message.content);
      case MODE.Busy:
      case MODE.Offline:
        const content = await TemplateService.renderTemplate(template, {
          message,
          extras,
        });

        message.reply(
          {
            content: ent.decode(content),
          },
          {
            typing: true,
            returnMessage: false,
          },
        );

        break;
      default:
        console.log('Mode not implemented');
    }
  }
}
