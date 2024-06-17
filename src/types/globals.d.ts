import type { Client, Message } from 'messenger-api.js';

export global {
  interface CommandCallback {
    (client: Client, message: Message, ...args: string[]): void;
  }
}
