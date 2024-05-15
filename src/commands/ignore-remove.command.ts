import CommandService from '../services/command.service';
import DataService from '../services/data.service';

CommandService.command<CommandCallback>(
  'ignore remove',
  async function ignoreRemove(_, message, ...args) {
    const value = Number(args.join(' '));
    const ignore = await DataService.get('ignore');

    if (isNaN(value) || value < 0 || value > ignore.length - 1) {
      await message.reply(
        { content: `invalid value: ${value}` },
        {
          typing: false,
          returnMessage: false,
        },
      );

      return;
    }

    ignore.splice(value, 1);

    await DataService.set('ignore', ignore);

    await message.reply(
      { content: `ignore removed: ${value}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
