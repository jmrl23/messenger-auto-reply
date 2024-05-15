import type { Client, Message } from 'messenger-api.js';
import type { MODE } from '../constants/data.constant';

export global {
  interface AppData {
    active: boolean;
    mode: MODE;
    ignore: string[];
  }

  interface CommandCallback {
    (client: Client, message: Message, ...rest: args[]): void;
  }
}
