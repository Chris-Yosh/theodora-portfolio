import { useCallback, useEffect, useState } from 'react';
import { dateKey } from './core/shine';
import { AppState, EMPTY_STATE, Routine } from './core/types';
import { loadState, saveState } from './storage';

export function useStore() {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadState().then((s) => {
      setState(s);
      setReady(true);
    });
  }, []);

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const addRoutine = useCallback(
    (r: Pick<Routine, 'name' | 'emoji' | 'days'>) =>
      update((s) => ({
        ...s,
        routines: [
          ...s.routines,
          { ...r, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), createdOn: dateKey(new Date()) },
        ],
      })),
    [update],
  );

  const removeRoutine = useCallback(
    (id: string) => update((s) => ({ ...s, routines: s.routines.filter((r) => r.id !== id) })),
    [update],
  );

  const toggle = useCallback(
    (id: string, day: Date) =>
      update((s) => {
        const key = dateKey(day);
        const done = new Set(s.completions[key] ?? []);
        done.has(id) ? done.delete(id) : done.add(id);
        return { ...s, completions: { ...s.completions, [key]: [...done] } };
      }),
    [update],
  );

  return { state, ready, addRoutine, removeRoutine, toggle };
}
