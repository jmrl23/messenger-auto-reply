import CommandService from '../services/command.service';
import DataService from '../services/data.service';

CommandService.command<CommandCallback>(
  'disable',
  async function disable(_, message) {
    const appData = await DataService.set('active', false);

    message.reply(
      { content: `active: ${appData.active.toString()}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
