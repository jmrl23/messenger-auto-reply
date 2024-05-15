import CommandService from '../services/command.service';

CommandService.command<CommandCallback>('ping', function (_, message) {
  message.reply(
    { content: 'pong' },
    {
      typing: false,
      returnMessage: false,
    },
  );
});
