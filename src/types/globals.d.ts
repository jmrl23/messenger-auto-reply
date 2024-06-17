import type { Client, Message } from 'messenger-api.js';
import type { MODE } from '../constants/data.constant';

export global {
  interface CommandCallback {
    (client: Client, message: Message, ...args: string[]): void;
  }
}
