import { MODES } from '../constants/data.constant';
import CommandService from '../services/command.service';

CommandService.command<CommandCallback>(
  'mode list',
  async function modeList(_, message) {
    const keys = MODES.map((key) => `- ${key.toLowerCase()}`).join('\n');

    message.reply(
      { content: `modes:\n\n${keys}` },
      { typing: false, returnMessage: false },
    );
  },
);
