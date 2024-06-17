import path from 'node:path';

export const DOTENV_PATH = path.resolve(__dirname, '../../.env');

export const DATA_DIR = path.resolve(__dirname, '../../data');

export const FBSTATE_PATH = path.resolve(DATA_DIR, 'fbstate.json');

export const DATA_PATH = path.resolve(DATA_DIR, 'data.json');

export const TEMPLATE_DIR = path.resolve(__dirname, '../../templates');
