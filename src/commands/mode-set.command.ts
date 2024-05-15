import { MODE } from '../constants/data.constant';
import CommandService from '../services/command.service';
import DataService from '../services/data.service';

const modes = new Map<string, MODE>([
  ['ai', MODE.Ai],
  ['busy', MODE.Busy],
  ['offline', MODE.Offline],
]);

CommandService.command<CommandCallback>(
  'mode set',
  async function modeSet(_, message, ...args) {
    const value = args.join(' ');
    const mode = modes.get(value);

    if (mode === undefined) {
      message.reply(
        { content: `invalid mode: ${value}` },
        {
          typing: false,
          returnMessage: false,
        },
      );

      return;
    }

    await DataService.set('mode', mode);
    message.reply(
      { content: `mode: ${value}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
