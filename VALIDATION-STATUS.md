# Validation status

## Checks run

- `node scripts/validate-project.cjs`: **56/56** checks passed, including local image references and Cloudinary integration/configuration checks.
- `npm run build` in `frontend`: passed after the folder rename. Latest bundles: JavaScript **280.27 kB** (**82.63 kB gzip**), CSS **120.01 kB** (**23.81 kB gzip**), HTML **4.53 kB** (**1.57 kB gzip**).
- `node --check` passed for the media routes, Cloudinary helper, media model, and seed script.
- Local production preview returned HTTP 200.
- Optional Cloudinary configuration correctly selects local storage when unset and rejects partial credentials.

## Performance observations and limits

- Static image assets total approximately **9.48 MB**; seven programme WebP images range from about **0.91 MB to 1.22 MB** each. Program/gallery images are lazy-loaded, but those assets should be further resized/compressed for slower mobile connections.
- Bundle and local response checks do not provide real-world Core Web Vitals or confirm smoothness on a physical phone. Test mobile and Urdu/RTL layouts on target devices before launch.

## Not yet verified

- Cloudinary credentials are not configured in the local server environment. Upload, replacement, deletion, and delivery against a real Cloudinary account remain untested. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` privately on the backend/host; never expose them in frontend variables.
- Existing local media and static programme images are not automatically migrated to Cloudinary.
- Live admin, enquiry, and media flows against production hosting/database, Docker deployment, accessibility walkthrough, and physical-device QA remain to be tested.
- Run `npm audit` and verify database/media backups and restore procedures before production.
