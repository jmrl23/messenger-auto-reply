import { Client, Events, type ClientCredentials } from 'messenger-api.js';
import { FBSTATE_PATH } from './constants/paths.constant';
import readJsonFile from './utils/readJsonFile';
import DataService from './services/data.service';
import MessengerService from './services/messenger.service';
import './commands';

async function main() {
  const client = new Client({ online: false });
  const credentials = await readJsonFile<ClientCredentials[]>(FBSTATE_PATH);

  client.on(Events.Ready, async function ready(client) {
    await DataService.initialize();

    console.clear();
    console.log(`Logged as ${client.user.username}`);
  });

  client.on(Events.MessageCreate, async function messageCreate(message) {
    void MessengerService.processMessage(client, message);
  });

  client.login(credentials);
}

void main();
