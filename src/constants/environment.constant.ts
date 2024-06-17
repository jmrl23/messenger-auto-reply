import dotenv from 'dotenv';
import env from 'env-var';
import { DOTENV_PATH } from './paths.constant';

dotenv.config({ path: [DOTENV_PATH] });

export const OPENAI_API_KEY = env.get('OPENAI_API_KEY').required().asString();

export const OPENAI_BASE_URL = env.get('OPENAI_BASE_URL').asUrlString();
