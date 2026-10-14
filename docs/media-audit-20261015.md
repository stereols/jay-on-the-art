# Runtime media audit — 2026-10-15

The audit covered local assets referenced by the HTML pages, stylesheets and
application modules. Source artwork retained in the repository was distinguished
from the optimized files actually selected by the browser.

## Changes

| Runtime asset | Previous bytes | Optimized bytes | Reduction | Dimensions |
| --- | ---: | ---: | ---: | --- |
| Aelin screen atlas | 2,230,245 | 1,549,880 | 30.5% | 1672 × 940, unchanged |
| Personal artwork film | 43,720,503 | 26,369,555 | 39.7% | 1920 × 1080, unchanged |

- The screen atlas uses lossless WebP. Decoding both files to RGBA produced
  byte-identical pixels, including UI lettering. All four inline SVG viewBoxes
  use the same optimized atlas; their crop and layout remain intact.
- `scripts/optimize-images.mjs` now prepares this SVG-embedded raster as well as
  the existing responsive `<img>` assets, so a future source update is included
  by the regular image build.
- The film adds an AV1 MP4 as the first source. Its original H.264 MP4 remains
  the fallback for browsers without AV1 support. Lazy loading initializes both
  source candidates once and lets the browser select the supported format.
- The AV1 file retains all 933 frames, the original 29.97 fps timing, 8-bit
  4:2:0 colour and 31.132-second duration. Fast-start metadata precedes media
  data. No audio stream was present in the original.

## Existing assets retained

- The 17 ordinary page images already have high-quality WebP candidates up to
  their source resolution. Responsive source selection remains enabled. The
  multi-megabyte PNG/JPEG originals inside `<picture>` are fallback sources,
  rather than the default transfer in a WebP-capable browser.
- Transparent portrait and butterfly files already use WebP with alpha.
- The Aelin background film is already 2.43 MiB at 1280 × 704, with fast-start
  metadata and deferred loading. It was not transcoded again.
- Unreferenced source artwork was retained; its file size does not contribute
  to normal page transfers.

## Verification

- Full-frame VMAF comparison of all 933 AV1 frames against the existing H.264
  master: **97.712373 / 100**. This is a perceptual metric, not a claim that the
  video is lossless.
- Chrome local playback selected the AV1 source, reached `readyState: 4`, and
  reported a decoded size of 1920 × 1080 without a media error.
- All four Aelin SVG screens reference the lossless atlas. The final animation
  state keeps screen 4 active at scale 1, with the other screens on its flanks.
- Referenced local media paths exist. JavaScript syntax and Git whitespace
  checks passed; no browser console errors were observed during this check.

## AV1 reproduction

FFmpeg 7.1 with an AV1-capable NVIDIA encoder was used:

```text
ffmpeg -i assets/video/experience-into.mp4 -map 0:v:0 -c:v av1_nvenc -preset p7 -tune hq -rc vbr -cq 30 -b:v 0 -g 240 -pix_fmt yuv420p -movflags +faststart -an assets/video/experience-into-av1.mp4
```

Re-encoding is deliberate and separate from the ordinary build. Keep the
original master and repeat the quality comparison when changing this preset.
