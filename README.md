# Leisurely

> Meal planning, minus the stress.

A progressive web app for planning meals during vacations. Works fully offline, saves data locally, and makes building your grocery list effortless.

## Features (Phase 1 MVP)

- Set a vacation date range (up to 30 days)
- Meal grid: breakfast, lunch, dinner, and snacks for each day
- Dietary tags (vegetarian, vegan, gluten-free, etc.) and custom allergy tags (e.g. "Allergy: Shellfish")
- Auto-generated grocery list from your planned meals
- JSON export / import for backup and sharing
- Fully offline-capable PWA (installable on iOS and Android)

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS v3 — "Cozy Earth" design system
- Zustand — global state with IndexedDB persistence
- idb — IndexedDB wrapper
- vite-plugin-pwa — service worker + Web App Manifest
- React Router v6
- date-fns

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Roadmap

- **Phase 2:** Shared JSON file collaboration, PDF export, bulletin board
- **Phase 3:** Supabase real-time sync, auth, recipe database, dietary filters, packing list
