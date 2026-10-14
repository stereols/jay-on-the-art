# Aelin preview assets

`product-screens-source.png` is the unmodified user-supplied `aa.png` (1672 × 940). Four inline SVG viewports in `index.html` display the screen pixels without regenerating their contents. Their crop origins are (18,18), (432,18), (847,18), and (1262,18); each viewport is 391 × 903.

`aelin.svg` is the user-supplied outlined vector wordmark. It is loaded as an `object` document. Its native aspect ratio is 68.982 × 27.188; the CSS uses that ratio so the full vector remains undistorted.

Each `.aelin-device-surface` can independently receive a new image instead of the inline crop SVG. Keep the full phone screen visible and update the aspect ratio when new captures arrive. Screenshot controls are illustrations, not interactive product controls.

Animation lives in `aelin-showcase.js`; styling in `aelin-showcase.css`. The existing app motion controller owns enable/disable and the scroll update loop. Desktop pinning applies at 1000 × 700 or larger. Mobile, reduced motion and Motion off use the full four-screen document layout.
