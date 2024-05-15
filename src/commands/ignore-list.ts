import CommandService from '../services/command.service';
import DataService from '../services/data.service';

CommandService.command<CommandCallback>(
  'ignore list',
  async function ignoreList(_, message) {
    const ignore = await DataService.get('ignore');
    const ignoreStringified = ignore
      .map((value, index) => `${index}. ${value}`)
      .join('\n');

    await message.reply(
      { content: `ignore:\n\n${ignoreStringified}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
