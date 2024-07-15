export const MODES = ['Offline', 'Busy', 'Gpt'] as const;
export type Mode = (typeof MODES)[number];
