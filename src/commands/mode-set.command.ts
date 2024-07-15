import { MODES } from '../constants/data.constant';
import CommandService from '../services/command.service';
import DataService from '../services/data.service';

CommandService.command<CommandCallback>(
  'mode set',
  async function modeSet(_, message, ...args) {
    const value = args.join(' ');
    const mode = MODES.find(
      (mode) => value.toLowerCase() === mode.toLowerCase(),
    );

    if (!mode) {
      message.reply(
        { content: `invalid mode: ${value}` },
        { typing: false, returnMessage: false },
      );

      return;
    }

    await DataService.set('mode', mode);
    message.reply(
      { content: `mode: ${mode}` },
      { typing: false, returnMessage: false },
    );
  },
);
