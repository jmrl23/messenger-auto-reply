import CommandService from '../services/command.service';
import DataService from '../services/data.service';

CommandService.command<CommandCallback>(
  'disable',
  async function enable(_, message) {
    const appData = await DataService.set('active', true);
    await message.reply(
      { content: `active: ${appData.active.toString()}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
