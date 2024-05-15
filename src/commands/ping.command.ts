import CommandService from '../services/command.service';

CommandService.command<CommandCallback>('ping', function (_, message) {
  message.thread.send('pong');
});
