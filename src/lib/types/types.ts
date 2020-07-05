import type { TaskEntityCreateOptions } from '@lib/types/interfaces';

export type FetchTypes = 'json' | 'buffer' | 'text' | 'result';

export type DefaultJSON = Record<PropertyKey, unknown>;

export type TaskEntityEditOptions = Partial<Pick<TaskEntityCreateOptions, 'time' | 'data' | 'catchUp'>>;
