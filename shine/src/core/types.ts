export type Routine = {
  id: string;
  name: string;
  emoji: string;
  /** Weekdays the routine is due, 0 = Sunday … 6 = Saturday. */
  days: number[];
  /** YYYY-MM-DD of the day it was created; earlier days never count against it. */
  createdOn: string;
};

/** dateKey (YYYY-MM-DD) -> ids of routines completed that day. */
export type Completions = Record<string, string[]>;

export type AppState = {
  routines: Routine[];
  completions: Completions;
};

export const EMPTY_STATE: AppState = { routines: [], completions: {} };
