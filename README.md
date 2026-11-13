# Jamia-tur-Raza Ghousia Mehria — Full-Stack Website

A bilingual (English/Urdu) Islamic educational institution website with React 18, Vite, React Router, Node.js, Express, MongoDB/Mongoose, and JWT-based admin authentication. The source package includes the public website, backend API, uploaded/optimized assets, a one-service Docker build, Docker Compose, and a Render Blueprint.

## Current website features

- Premium emerald / ivory / muted-gold visual design, supplied Jamia logo and favicon, custom SVG programme art, and social-sharing card.
- Public pages: Home, About, Programmes, Events Gallery, Admissions, Contact, admin login, and admin dashboard.
- English/Urdu language switching with right-to-left layout for public Urdu pages.
- Owner & Principal profile and supplied portrait: Qari Ali Akhtar Awan Qadri.
- Phone/WhatsApp: +92 310 1582018; email: razajamiatur918@gmail.com.
- Address: Street 31-A, Jamilabad, near Kareemi General Store, Taxila, Pakistan.
- Google Maps link supplied by the Jamia: https://maps.app.goo.gl/rTft91KxQQDWvgxw6 (the link is included as supplied; the exact street-level pin has not been independently verified).
- Seven programmes: Hifz-ul-Qur’an, Nazra Qur’an, Tajweed, Teaching Program, Dars-e-Nizami, Qira’at, and Islamic Studies.
- Year-round admissions; requested documents listed as student B-Form and a copy of the father's CNIC; boys' hostel information shown with availability/rules/charges confirmed through the office.
- Contact/enquiry form saved through the API to MongoDB, protected admin login, programme/notice management, enquiry status management, and a bilingual draft privacy notice at `/privacy`.
- Rate limiting, Helmet, input validation, password hashing, JWT auth, environment-based secrets, centralized errors, SEO metadata, JSON-LD organization data, manifest, keyboard focus styles, and skip navigation.

## Recommended: one-service production deployment

The recommended deployment serves the built React frontend and Express `/api` from the same origin. The frontend defaults to relative `/api` in a production Vite build. This avoids separate CORS/API-domain setup in the usual case.

### Option A — Render + MongoDB Atlas

1. Push the whole folder to a GitHub repository. Never commit a real `.env` file.
2. Create a MongoDB Atlas database/user and configure network access for the hosting service. Keep access limited where practical.
3. In Render, select **New → Blueprint** and connect the repo containing `render.yaml` and `Dockerfile`.
4. Supply `MONGO_URI`, `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique strong `ADMIN_PASSWORD` when prompted. The blueprint generates `JWT_SECRET`.
5. If Render assigns a URL other than `https://jamia-tur-raza-ghousia-mehria.onrender.com`, update `CLIENT_URL` in the service environment to the exact deployed origin and redeploy.
6. Initialize the approved site records and administrator. If the plan provides service Shell, run `npm run seed` and `npm run create-admin` from `/app/backend`. Otherwise run the same commands locally against the intended database after double-checking the target and reviewing `backend/scripts/seed.js`. Back up any live database first.
7. Verify `https://YOUR-DOMAIN/api/health`, the public pages, English/Urdu switch, enquiry form, admin login, and management flows.

The provider's free-tier behaviour, shell access, and limits may change. Verify current plan features; for a real client launch, consider a suitable paid service, backups, and monitoring.

### Option B — Docker Compose (one `.env`, one service)

Requirements: Docker Desktop with Compose, and internet access for first-time image/package downloads.

1. Copy the root `.env.example` to `.env`.
2. Set `MONGO_URI`, a unique `JWT_SECRET` (32+ characters), `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), and `CLIENT_URL=http://localhost:5000`. Generate a safe secret with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`, then paste it into `.env`. Change all example values. The server intentionally refuses to start when the MongoDB URI or JWT secret still contains known placeholders. Do not share or commit `.env`.
3. Build the full stack:

   ```sh
   docker compose build
   ```

4. Seed the confirmed programmes/admissions notice, then create the admin account:

   ```sh
   docker compose run --rm jamia-website npm run seed
   docker compose run --rm jamia-website npm run create-admin
   ```

5. Start the service:

   ```sh
   docker compose up -d
   ```

6. Open `http://localhost:5000`; health endpoint: `http://localhost:5000/api/health`. Use `docker compose logs -f jamia-website` to inspect logs and `docker compose down` to stop the service.

### Option C — local development without Docker

Terminal 1 (backend):

```powershell
cd backend
Copy-Item .env.example .env
# Edit backend/.env: MONGO_URI, JWT_SECRET, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed
npm run create-admin
npm run dev
```

Terminal 2 (frontend):

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Visit `http://localhost:5173`. The development frontend calls `http://localhost:5000/api`. Keep both terminals running. On Windows, `scripts/setup-windows.ps1` copies env examples and installs dependencies; after editing `backend/.env`, `START-WINDOWS.bat` starts both development terminals. Run `node scripts/validate-project.cjs` from the project root for a lightweight files/config/image-reference check (it does not replace a build or browser test).

## Environment variables

- `MONGO_URI`: private database connection string. Never put it in `frontend/.env`.
- `JWT_SECRET`: random, unique secret of at least 32 characters.
- `JWT_EXPIRES_IN`: token expiration (default `1d`).
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: values used by `npm run create-admin`. No default admin credentials are included.
- `CLIENT_URL`: exact origin allowed by the backend CORS policy; no trailing slash. On Render, set it to the actual assigned domain.
- `SITE_URL`: optional absolute public site origin for canonical/Open Graph metadata; if blank, the production server derives the origin from the incoming request (and supports `RENDER_EXTERNAL_URL`).
- `TRUST_PROXY=1`: enable only when behind a trusted reverse proxy such as Render.
- `SERVE_FRONTEND=true`: serve `frontend/dist` from Express in single-service production deployment.
- `VITE_API_URL`: optional; only needed for separate frontend/backend hosting. A production build defaults to relative `/api`.

## Before public launch

- Have the institution review and approve the included draft privacy notice at `/privacy`; it is not legal advice.
- Confirm the official Urdu spelling and permission to publish the supplied owner/contact information.
- Confirm image publication permissions, especially for identifiable children in event photographs.
- Verify the exact Google Maps pin/address with the institution.
- Confirm course details, durations, timetable, eligibility, admission documents, and hostel rules/charges. These have not been invented.
- Test at 320, 360, 375, 390, 412, 768, 1024, and 1440 CSS-pixel widths, including Urdu RTL, using browser tools and an actual Android phone.
- Test admin authorization, contact submission, programme/notice management, database backups/restores, performance, keyboard access, and privacy wording.
- Set final domain, HTTPS, CORS origin, backups, and monitoring.

## Validation note

The current frontend production build and the 51 project/source/asset validation checks pass in the development workspace. This does not replace live MongoDB/API, admin, enquiry, Cloudinary credential, browser/device, or production hosting tests. Review `VALIDATION-STATUS.md`, `PREMIUM-BUILD-NOTES.md`, `CLIENT-CONTENT-CHECKLIST.md`, and `deployment/DEPLOYMENT-GUIDE.md` before launch.


## Admin media library

The dashboard includes an authenticated media library at `/admin/login` → **Media library**. Upload JPEG/JPG, PNG, or WebP images up to 5 MB, preview assets, edit their title/alt text/category, replace the file while preserving its current page assignment, publish it to the public gallery, a course card, an event gallery, or the homepage banner, and delete assets. Uploaded files default to `backend/uploads/media`; set `MEDIA_UPLOAD_DIR` to an absolute path on a persistent mounted disk when hosting supports it. Optionally set all three `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` server variables to store new uploads in Cloudinary and serve them with automatic format/quality optimization. Existing local media is not migrated automatically. The API validates file signatures in addition to MIME type and stores generated safe filenames or Cloudinary public IDs.

For local development, configure `backend/.env` from `backend/.env.example` and set `CLIENT_URL=http://localhost:5173`. Keep the root and server `.env` files private. Without Cloudinary, production hosting must provide persistent disk storage. Docker Compose uses a named volume for local uploads. Back up uploaded media separately from MongoDB.
