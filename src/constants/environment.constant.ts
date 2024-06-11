import env from 'env-var';

export const OPENAI_API_KEY = env.get('OPENAI_API_KEY').required().asString();
