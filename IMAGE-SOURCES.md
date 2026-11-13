# Image and branding sources

## Assets supplied by the Jamia/client

- `frontend/public/images/jamia-logo-full.webp`: cleaned and optimized copy of the supplied Jamia logo. The original PNG had a decorative checkerboard background baked into the image; that background was removed where possible.
- `frontend/public/images/jamia-logo-mark.webp`: compact transparent/cropped mark derived from the supplied logo for the header.
- `frontend/public/images/qari-ali-akhtar-awan.webp`: client-supplied Owner & Principal portrait, resized/compressed for web use; no face retouching applied.
- `frontend/public/images/events/event-01.webp` to `event-07.webp`: compressed versions of event photos included in the client-provided assets ZIP. The current public gallery uses five selected photographs.
- `review-assets/optimized-posters/provided-poster-*.webp`: optimized copies of supplied promotional posters/graphics, retained for review. They are not auto-published as current notices because dates and event details may be old or ambiguous.

## Locally created visuals

- `frontend/public/images/jamia-emblem.svg`: custom scalable emblem asset.
- `frontend/public/images/islamic-pattern.svg`: decorative Islamic geometric pattern.
- `frontend/public/images/program-*.svg`: locally created vector illustrations for the programme cards.
- `frontend/public/images/visual-placeholder.svg`: local fallback image.
- `frontend/public/images/social-card.svg`: social preview card.

The active homepage and gallery use local images; no external stock-photo dependency is required for the main visuals. Google Fonts are requested remotely, with CSS fallbacks if they fail to load. Review photo consent and permission before deploying, especially for identifiable minors.
