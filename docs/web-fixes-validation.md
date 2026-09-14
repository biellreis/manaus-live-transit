# Web transit fixes — 2026-09-14

- Bundle and configure the MapLibre 6 worker through Vite's `?worker&url` pipeline. Raster tiles and DOM markers could appear without this worker, while route GeoJSON could not render.
- Size the web root with the dynamic viewport and keep only the device safe area below navigation.
- Show itinerary data as soon as it arrives, independently of timetable loading.
- Memoize transfer-stop compatibility and endpoint scores; retain only the best candidate per line combination instead of sorting every possible combination.
- Classify vehicle direction using the same trip IDs and itinerary classification as the line screen. Unknown directions remain visible. Do not remove valid route-feed vehicles based on distance to a displayed segment. Include northern Manaus coordinates previously rejected by the narrow bounding box.

## Validation

Client and server production builds passed. `server/node_modules/.bin/tsx --test tests/web-regressions.test.ts`: 3 passed.

T3 → T1 candidate calculation: original 4044 ms; updated approximately 600–640 ms locally. Same five line/trip/boarding/alighting results. This measures calculation, not mobile network latency.

The iPhone 17 Pro simulator running the production build through Safari showed the T3 → T1 route and both directions of line 640.

The existing `tests/routing.test.ts` suite has five failures reproduced unchanged against original commit db9a2f4: three geometry slicing/fallback expectations, nearby-stop transfer policy, and unknown speed default. These predate this change; the new suite does not replace them.
