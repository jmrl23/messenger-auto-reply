import { MODE } from '../constants/data.constant';
import CommandService from '../services/command.service';

CommandService.command<CommandCallback>(
  'mode list',
  async function modeList(_, message) {
    const keys = Object.keys(MODE).filter((value) => isNaN(Number(value)));
    const keysStringified = keys
      .map((key) => `- ${key.toLowerCase()}`)
      .join('\n');

    message.reply(
      { content: `modes:\n\n${keysStringified}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
