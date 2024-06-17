import env from 'env-var';

export const OPENAI_API_KEY = env.get('OPENAI_API_KEY').required().asString();

export const OPENAI_BASE_URL = env.get('OPENAI_BASE_URL').asUrlString();
