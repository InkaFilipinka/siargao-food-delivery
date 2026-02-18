# Map components backup - 2026-02-18

Backup of food delivery map implementation before switching to scooter project's approach for QA.

## To restore

1. Copy `map-picker.tsx` → `src/components/map-picker.tsx`
2. Copy `google-maps-loader.tsx` → `src/components/google-maps-loader.tsx`
3. In `src/app/layout.tsx`, add:
   - `import { GoogleMapsLoader } from "@/components/google-maps-loader";`
   - `<GoogleMapsLoader />` inside `<body>` (before `<LocaleProvider>`)
