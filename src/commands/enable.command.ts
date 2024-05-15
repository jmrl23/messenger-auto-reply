import CommandService from '../services/command.service';
import DataService from '../services/data.service';

CommandService.command<CommandCallback>(
  'enable',
  async function enable(_, message) {
    const appData = await DataService.set('active', true);

    message.reply(
      { content: `active: ${appData.active.toString()}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
