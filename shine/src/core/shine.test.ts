import { computeShine, dateKey, addDays, GAIN_PER_DAY } from './shine';
import { Routine } from './types';

const ALL = [0, 1, 2, 3, 4, 5, 6];
const today = new Date(2026, 5, 20);
const mk = (daysAgo: number, id = 'a', days = ALL): Routine => ({
  id, name: id, emoji: '✨', days, createdOn: dateKey(addDays(today, -daysAgo)),
});

test('no routines -> dormant', () => {
  expect(computeShine([], {}, today)).toEqual({ energy: 0, streak: 0, todayRatio: null });
});

test('perfect days build energy and streak', () => {
  const r = mk(10);
  const c: Record<string, string[]> = {};
  for (let i = 0; i <= 10; i++) c[dateKey(addDays(today, -i))] = ['a'];
  const s = computeShine([r], c, today);
  expect(s.streak).toBe(11);
  expect(s.energy).toBeCloseTo(11 * GAIN_PER_DAY);
});

test('missed days drain energy and reset streak', () => {
  const r = mk(10);
  const c: Record<string, string[]> = {};
  for (let i = 6; i <= 10; i++) c[dateKey(addDays(today, -i))] = ['a'];
  const s = computeShine([r], c, today);
  expect(s.energy).toBe(0);
  expect(s.streak).toBe(0);
});

test('today in progress is never penalised', () => {
  const s = computeShine([mk(0, 'a'), mk(0, 'b')], { [dateKey(today)]: ['a'] }, today);
  expect(s.todayRatio).toBe(0.5);
  expect(s.energy).toBeCloseTo(0.025);
});

test('rest days are neutral', () => {
  const r = mk(7, 'a', [today.getDay()]); // due once a week, only today and 7 days ago
  const c = { [dateKey(addDays(today, -7))]: ['a'], [dateKey(today)]: ['a'] };
  expect(computeShine([r], c, today).energy).toBeCloseTo(2 * GAIN_PER_DAY);
});
