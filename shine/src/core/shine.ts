import { Completions, Routine } from './types';

/** Energy gained on a fully completed day, and lost on a fully missed one. */
export const GAIN_PER_DAY = 0.05;
export const LOSS_PER_DAY = 0.08;

export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  return r;
}

/** Routines due on a given day. */
export function dueOn(routines: Routine[], day: Date): Routine[] {
  const key = dateKey(day);
  return routines.filter((r) => r.createdOn <= key && r.days.includes(day.getDay()));
}

function ratioFor(routines: Routine[], completions: Completions, day: Date): number | null {
  const due = dueOn(routines, day);
  if (due.length === 0) return null;
  const done = new Set(completions[dateKey(day)] ?? []);
  return due.filter((r) => done.has(r.id)).length / due.length;
}

export type Shine = {
  /** 0 (dull, barely spinning) … 1 (blazing, spinning fast). */
  energy: number;
  /** Consecutive fully completed days, today counted once it is complete. */
  streak: number;
  /** Share of today's routines done, null when nothing is due today. */
  todayRatio: number | null;
};

/**
 * Walk day by day from the first routine to today. Finished days add or remove
 * energy according to how much was done; today only ever adds, so a day in
 * progress is never punished and ticking a routine gives instant feedback.
 */
export function computeShine(routines: Routine[], completions: Completions, today: Date): Shine {
  const todayRatio = ratioFor(routines, completions, today);
  if (routines.length === 0) return { energy: 0, streak: 0, todayRatio };

  const start = parseKey(routines.map((r) => r.createdOn).sort()[0]);
  let energy = 0;
  let streak = 0;
  for (let d = start; dateKey(d) < dateKey(today); d = addDays(d, 1)) {
    const ratio = ratioFor(routines, completions, d);
    if (ratio === null) continue; // rest day: neither gain nor loss
    energy += ratio * GAIN_PER_DAY - (1 - ratio) * LOSS_PER_DAY;
    energy = Math.min(1, Math.max(0, energy));
    streak = ratio === 1 ? streak + 1 : 0;
  }
  if (todayRatio !== null) {
    energy = Math.min(1, energy + todayRatio * GAIN_PER_DAY);
    if (todayRatio === 1) streak += 1;
  }
  return { energy, streak, todayRatio };
}

export function shineLabel(energy: number): string {
  if (energy < 0.1) return 'Dormant';
  if (energy < 0.3) return 'Awakening';
  if (energy < 0.55) return 'Glowing';
  if (energy < 0.8) return 'Bright';
  return 'Radiant';
}
