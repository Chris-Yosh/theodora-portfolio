# Shine

A routine tracker where a translucent diamond is your motivation: the more consistently
you keep your routines, the brighter it glows and the faster it spins.

## Run
```bash
npm install
npx expo start      # scan the QR code with Expo Go (iOS / Android)
npm test            # shine-logic unit tests
```

## How shine works (`src/core/shine.ts`)
- Each day, completed ÷ due routines gives a ratio.
- Finished days add `ratio × 0.05` and remove `(1 − ratio) × 0.08` energy (clamped 0–1), so ~20 perfect days = fully radiant, and slacking drains it faster than it builds.
- Rest days (nothing due) change nothing. Today never penalises, so ticking a routine lights the diamond instantly.
- Energy drives spin speed, opacity and glow in `src/components/Diamond.tsx`.

## Roadmap
Swappable avatars (tree, dog…), sharing routines, accounts + sync, reminders, history/stats.
