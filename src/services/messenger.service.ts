import type { Client, Message, User } from 'messenger-api.js';
import { MODE } from '../constants/data.constant';
import { DataService } from './data.service';
import { GEN_AI_API_KEY } from '../constants/environment.constant';
import CommandService from './command.service';
import TemplateService from './template.service';
import GenAiService from './genai.service';
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

    switch (mode) {
      case MODE.Ai:
        {
          let genAiService = GenAiService.getInstanceById(message.threadId);

          if (!genAiService) {
            genAiService = await GenAiService.createInstance(
              message.threadId,
              GEN_AI_API_KEY,
              'gemini-pro',
            );

            // await genAiService.sendMessage('Your initial message to AI');
          }

          const response = await genAiService.sendMessage(message.content);
          const content = await TemplateService.renderTemplate(template, {
            aiResponseMessage: response.response.text(),
          });

          await message.reply(
            {
              content: ent.decode(content),
            },
            {
              typing: true,
              returnMessage: false,
            },
          );
        }

        break;
      case MODE.Busy:
      case MODE.Offline:
        const content = await TemplateService.renderTemplate(template, {
          message,
        });

        await message.reply(
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
