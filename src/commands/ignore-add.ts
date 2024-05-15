import CommandService from '../services/command.service';
import DataService from '../services/data.service';

CommandService.command<CommandCallback>(
  'ignore add',
  async function ignoreAdd(_, message, ...args) {
    const value = args.join(' ');
    const ignore = await DataService.get('ignore');

    if (value in ignore) {
      await message.reply(
        { content: `already ignored: ${value}` },
        {
          typing: false,
          returnMessage: false,
        },
      );

      return;
    }

    ignore.push(value);

    await DataService.set('ignore', ignore);

    await message.reply(
      { content: `ignored: ${value}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
