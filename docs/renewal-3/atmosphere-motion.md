# Atmosphere and Experience motion

## Local revision — 2026-10-15

This revision implements a moving luminous point that loops independently of
scroll position; its visible tail records the movement it actually makes. The
homepage's primary planet keeps the
`#FF616B` palette. The existing planet materials, camera timeline and renderer
provide the environment for the new motion.

The revised files are local work. Deployment remains paused. This documentation
update does not commit, push, publish or run tests, and it does not establish that
the public site contains this revision.

## One scene for planets, point and portrait

- `cosmos.js` owns the shared Three scene and render loop. It updates
  `cosmos-trail.js` and `experience-visual.js` with the same camera, viewport,
  motion setting and fullscreen-film visibility.
- `cosmos-trail.js` guides one pink light around a broad 24-second loop that
  spans both sides, the top and bottom, and positions outside the viewport. It
  starts beyond the upper-left edge. Scroll position and pointer movement do
  not steer its route.
- Damped acceleration gives the point inertia. A circular buffer records its
  actual positions and timestamps. Interpolated samples form a tapered ribbon,
  a narrow filament and a soft surrounding glow.
- Speed increases the tail's lifetime and width. The tail shortens as old
  samples expire. Re-entry after suppression resets movement history so a long
  hidden trail does not cross the page.
- The route also supplies depth. The point and ribbon can pass in front of or
  behind scene objects using depth testing. Artwork remains in its existing
  media surface and can hide the point while the route crosses it.
- The enlarged point is solid brand pink with soft edges and reduced opacity.
  It starts just beyond the upper-left edge, sweeps through a broad closed
  curve, and repeats at a steady pace. Its depth remains in front of the planet.
  The homepage location annotation
  and its leader line are removed.
- The moving point and tail fade out before **상상을 현실의 경험으로.** and stay
  hidden throughout the following sections, including the footer. Reverse
  scrolling restores them before the Experience passage.
- The old SVG crossflow overlay and its rectangular text masks are removed.
  No duplicate screen overlay is used to imitate a trail above the planets.
- `cosmos-compositor.js` keeps the existing background blur while rendering the
  travelling light and portrait sharply. Both passes share the same scene and
  camera, and the background depth is retained for foreground occlusion. The
  whole-canvas CSS blur is disabled when this compositor is active.

The camera and chapter destinations remain derived from absolute scroll. The
trail has its own clock and temporal history, independent of page scroll.

## Transparent text surroundings

`transparent-scenes.css` removes the opaque or translucent reading surfaces
from the relevant chapter, caption and text containers. It also removes the
project-description backdrop blur and the Aelin background pseudo-element.
The page's ivory foundation remains behind the shared scene.

Letters retain their normal DOM rendering and reading order. Their container
rectangles do not erase the atmosphere. Actual images, phone screens, video and
navigation controls retain the surfaces required by their content. Print uses a
plain white page.

## Centered Experience composition

- **세계를 만들며 쌓아온 경험.** and the portrait form one centered group.
  Desktop combines a text column with a portrait up to 364px wide, approximately
  70% of the earlier 520px hero size. Viewport-height limits keep the whole body
  in view. Mobile stacks centered text and a portrait up to 235px wide.
- The illustration preserves the supplied likeness, orange cardigan, seated
  pose, subtle painted treatment and Apple logo on the laptop. It appears only
  in the Experience introduction.
- `experience-character.js` reads the real DOM layout and returns normalized
  viewport coordinates for `portrait`, `hand` and `glow`, along with arrival,
  entry, exit, visibility and emphasis values. The palm anchor is at approximately
  `(0.89, 0.30)` within the complete transparent source; the light anchor is
  above it at `(0.89, 0.25)`.
- Entrance, exit and small vertical displacement follow scroll progress. There
  is no independent CSS float that could make the hand drift away from its
  light. `measureAnchors()` is available for refreshing coordinates.
- In the desktop motion layout the artwork uses a fixed, transparent anchor
  stage while its original grid slot preserves the introduction layout. The
  introduction's release movement is cancelled through the career list; the
  list's lower boundary fades the portrait and hand light out together while
  their viewport position stays fixed. The fade runs while that boundary moves
  from 95% to 53% of the viewport height; a 100ms opacity response smooths
  coarse scroll input without introducing any exit displacement.
  The career list reserves its right column for this continuous composition.
  Returning upward restores the same coordinates without an extra entrance.
- `experience-visual.js` renders the same alpha portrait inside the planet scene.
  Only visible image pixels write depth; its transparent surroundings do not
  become a rectangular obstruction. The DOM image remains measurable and
  provides the fallback when the 3D portrait is unavailable or motion is off.
- A pink light, fine orbital rings and small sparks sit above the open palm.
  A separate soft solid pink point stays fixed at the effect's center. It
  follows the hand anchor and never depends on the travelling point's route.

## Aelin-only butterfly

- `aelin-companion.js` owns the butterfly exclusively within `#aelin-showcase`.
  It has been removed from the Experience introduction.
- Its size is approximately 60% of the previous pet: 61px on desktop and 47px
  on mobile. The supplied body and two wing layers retain transparency.
- While the Aelin section is visible, the butterfly repeatedly follows curved
  flights and pauses at resting positions. It has no timed disappearance or
  one-visit limit.
- A tap, click or keyboard activation sends it quickly to a different position;
  normal flight and rest cycles then resume. It remains within the section.
- The controller alternates broad landing positions across the full width and
  height. Flights may cross headings, text and phone artwork. A transparent fixed layer is
  clipped to the section's visible bounds so the long mobile story can retain
  one continuous companion without leaking into other chapters.
- Its animation loop runs only while visible and moving. Hidden tabs and open
  navigation or resume overlays suspend its display and interaction.

## Motion controls and fullscreen films

Actual fullscreen-video coverage suppresses the luminous point, its tail and
the Experience light through the shared atmosphere visibility value. The
butterfly is scoped to the following Aelin showcase, not the preceding film.

Motion off and reduced-motion settings remove time-based trail travel, orbital
animation and portrait displacement. The DOM portrait remains visible. The
butterfly stays perched while its section is visible; activation can reposition
it without animated travel. The existing pink CSS fallback remains available
when WebGL cannot render.

## Assets and build contract

Runtime artwork is in `assets/characters/`. `jay-hero.webp` and its 512px variant
retain alpha transparency. The three pet WebPs share an aligned square canvas;
the two `*-source.png` files preserve the generated cutouts.

The portrait editing brief preserved the face, glasses, smile, clothing, laptop
and pose; removed the collage, background geometry and baked hand light; added
a perspective-correct Apple logo; and applied restrained illustration detail.
The hand light is now generated by the shared 3D scene, allowing the travelling
point to interact with it. The pet brief preserved its orange/green eyes and
wing pattern while separating body and wings for motion. WebP exports use
quality 92 and alpha quality 100.

`npm run build` synchronizes the existing wordmarks, builds `cosmos.bundle.js`
and prepares page images. `data-manual-media` keeps the alpha artwork outside
the general photograph rewrite pipeline. The current local script revision
identifier is `20261015-career-fade-fast`.

The transition into the fullscreen Aelin film waits for the MORAI chapter to
release. Chapter lighting stays at the ivory setting while the Works scene is
active, then eases in over the first 16% of the viewport as the film enters.
The header follows the same delayed coverage cue. Its light and dark surfaces
use 38% and 30% opacity respectively, with a 6px backdrop blur. This remains a
local-only revision.

## Review focus before publication

Inspect the moving result across chapter boundaries, including reverse scroll,
fullscreen-film transitions and the Experience arrival and release. Confirm
that text surroundings stay transparent, the hand light follows the portrait,
and the butterfly remains inside Aelin after repeated flight/rest/tap cycles.
Check the same behavior at mobile widths and with reduced motion. Record any
verification separately; this document does not claim those checks have passed.
