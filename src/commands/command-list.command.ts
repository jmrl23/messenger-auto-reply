import CommandService from '../services/command.service';

CommandService.command<CommandCallback>(
  'command list',
  async function commandList(_, message) {
    const commands = CommandService.getRegisteredCommands();
    const commandsStringify = commands
      .map((command) => `- ${command}`)
      .join('\n');

    message.reply(
      { content: `commands:\n\n${commandsStringify}` },
      {
        typing: false,
        returnMessage: false,
      },
    );
  },
);
