import env from 'env-var';

export const GEN_AI_API_KEY = env.get('GEN_AI_API_KEY').required().asString();
