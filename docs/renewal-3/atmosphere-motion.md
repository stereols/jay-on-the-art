# Atmosphere and Experience motion

## Final scope — 2026-10-15

The original homepage composition stays in place. Its primary planet uses
`#FF616B`. Crossed ribbons continue throughout the page. The illustrated person
and pet appear only beside **세계를 만들며 쌓아온 경험.**, following the user's
request to retry this composition at 70% of the earlier size.

## Experience composition

- The portrait replaces the previous right-column concept image. Maximum width
  is 364px (70% of the earlier 520px); a viewport-height cap keeps the whole body
  visible. Mobile uses a 210px portrait below the text.
- The illustration retains the supplied likeness, orange cardigan and pose,
  with a restrained painted finish and a visible Apple logo on the laptop.
- A 101px pet appears once per page visit, after the arrival settles. Its entire
  visit lasts roughly five seconds. Tap, click or keyboard activation triggers
  a short reaction and departure. It never follows the reader into other chapters.
- The existing arrival fade owns the composition's opacity. Gentle float and
  entrance/exit transforms act on an inner wrapper, preserving layout geometry.
- Motion off, reduced motion, hidden tabs and navigation overlays suspend or
  suppress the pet and floating motion.

## Coordinated atmosphere

- `camera-timeline.js` adds reveal and release poses around the pinned Experience
  arrival. All positions, targets and orbital angles derive from absolute scroll,
  so returning upward follows the same path. Mobile finishes the dark-to-light
  passage before the career introduction is read.
- `experience-character.js` supplies entry/exit energy. Entry fades continuously
  with the arrival opacity; settled reading has no extra orbital accents.
- `cosmos.js` uses that energy for three open inclined arcs and small moving
  highlights around the career planet. Their rotation follows passage progress.
  The green career planet retains its established color; the homepage primary
  planet has the pink mineral palette.
- `crossflow-overlay.js` uses the same route as the background 3D ribbons, then
  expands their spacing and width with Experience energy. A fixed SVG layer
  carries the lines above opaque chapter backgrounds. Soft masks keep visible
  text, controls and artwork clear. Mobile reduces the number and weight of lines.
- The existing page scroll update drives the overlay. It adds no independent
  scroll listener or permanent animation loop. The pet's brief visit is the only
  additional temporary animation loop.
- Actual video coverage hides decorative lines during both fullscreen films.
  `cosmos-atmosphere.css` provides the pink fallback when WebGL is unavailable.

## Assets and reproduction

Runtime files are in `assets/characters/`. `jay-hero.webp` and its 512px variant
retain alpha transparency; the three pet WebPs share the same square canvas.
The two `*-source.png` files preserve the generated source cutouts.

Image editing brief used for the portrait: preserve the supplied face, glasses,
smile, orange cardigan, green tie, shorts, laptop, socks, shoes and seated pose;
remove the collage, orbit graphics and hand-held light; use a transparent
background. Add a small, perspective-correct bitten Apple logo to the laptop lid.
Refine toward 80% natural likeness and 20% illustration with restrained pencil
edges, softly painted fabric, warm ivory highlights and a subtle coral rim.

Pet brief: preserve the supplied orange/green eyes and wing pattern; provide
separate body, left wings and right wings on transparent backgrounds. The source
atlas was sliced and aligned onto matching 1000px canvases, then exported at
512px. Portrait and pet WebPs use quality 92 and alpha quality 100.

## Build and visual inspection

`npm run build` synchronizes the existing wordmarks, builds `cosmos.bundle.js`
and optimizes page images. `data-manual-media` prevents the alpha sprites from
being rewritten by the general photograph pipeline.

Desktop arrival, entry/exit compositions, later-page ribbon visibility and the
mobile portrait layout were visually inspected. No test suite was added or run
for this revision. The app and camera/bundle URLs carry the Experience revision
identifier to prevent the previous atmosphere script from being reused.
