# Atmosphere motion — final scope

The 2026-10-15 revision retains the existing homepage composition and adds only
the pink primary planet and continuous crossed background ribbons. Character and
pet elements were withdrawn during review and are not included in the website.

## Rendering

- `cosmos.js` gives the primary planet a dedicated `#FF616B` mineral palette,
  including its shell, membranes, rim lighting and night reflections. Secondary
  planets keep their established palette, including the purple passage world.
- `cosmos-crossflow.js` derives two curved ribbons and supporting fine threads
  from the camera timeline's absolute orbit. Forward and reverse scroll produce
  the same geometry. The existing renderer owns all drawing; no extra animation
  loop or scroll handler is introduced.
- Ribbon strength decreases in reading sections and reaches zero through the
  close-up passage. Mobile uses fewer fine threads and lower opacity.
- `app.js` supplies actual video coverage through `setAtmosphere({visibility})`.
  This suppresses the ribbons during both immersive films, including the film
  entering over MORAI before the semantic chapter changes.
- `cosmos-atmosphere.css` provides a native pink fallback when WebGL is unavailable.
- Rebuild `cosmos.bundle.js` after source edits. The site serves the compiled file.

## Checks performed

Desktop and mobile rendering, absence of character/pet elements, original hero
placement, no horizontal overflow, fullscreen video suppression, absolute camera
round-trip continuity, Motion off, reduced motion and static fallback were checked.
The browser reported no uncaught script errors during these checks.
