# Build phases and release checklist

## Completed in this source build

1. **Institution identity** — official English name, supplied Urdu name, establishment year 2025, supplied logo cleaned to transparent WebP where possible, SVG icon assets, favicon and social card.
2. **Real content** — Owner & Principal profile/portrait, contact information, address and Google Maps URL supplied by the client.
3. **Learning programs** — Hifz-ul-Qur’an, Nazra Qur’an, Tajweed, Teaching Program, Dars-e-Nizami, Qira’at and Islamic Studies; durations and curricula are not invented.
4. **Admissions** — open throughout the year; student B-Form and father's CNIC-copy checklist; boys' hostel marked as available with terms to confirm through the office.
5. **Visual experience** — responsive pages, supplied event photographs, custom SVG programme art, photo gallery, bilingual public page content and RTL layout.
6. **Application integration** — seed script upserts the seven programmes and an admissions notice while preserving unrelated admin-created content; prior API/admin/data architecture is retained.
7. **Basic quality checks** — JS/JSX parse/transpile syntax, Node syntax checks, manifest JSON, SVG XML, CSS brace balance, asset existence, ZIP integrity.

## Not yet verified (release blockers)

- Vite production build: npm dependency installation timed out in the build environment, so do not treat the production build as passed.
- MongoDB migration/seed, admin authentication, live inquiry submissions, permissions and destructive action checks.
- Real browser rendering on mobile/tablet/desktop, performance metrics, keyboard/screen-reader walkthrough, and deployed URL behaviour.
- Exact Maps pin, Urdu spelling approval, photo consent, and final client confirmation of public details.
- Production domain, hosting, environment variables, HTTPS, backups and privacy notice.

## Recommended next step on the developer's PC

1. Configure `backend/.env` and `frontend/.env` as described in README.
2. Run `npm install` in both `backend/` and `frontend/`.
3. Run `npm run build` in `frontend/` and fix every build error before deployment.
4. With the database correctly configured, test `npm run seed`, `npm run create-admin`, API health, all routes, enquiries and admin CRUD.
5. Review the gallery with the owner; obtain permission for identifiable individuals and minors before public release.
6. Deploy only after domain, CORS, HTTPS, database backup, privacy and production settings are verified.
