# Ultimate Semester Planner

A polished, browser-based **student semester planner web app template** built with React, TypeScript, Vite, and Tailwind CSS.

## Product overview

This template is designed for students who want one place to plan a semester, track academic work, monitor habits and progress, and export a printable planner.

### Included features

- Dashboard with semester overview
- Student profile
- Goals and progress tracking
- Subject tracker
- Timetable
- Monthly, weekly, and daily planning
- Assignment tracker
- Exam tracker
- Study progress
- Habit tracker
- Grade tracker
- Revision tracker
- Notes
- Important dates
- Semester reflection
- JSON import/export
- Personalized A4 PDF planner export
- Blank printable planner export
- Responsive layout
- Browser-local storage — no account or database required

## Quick start

Requirements: Node.js 20+, npm 10+ or pnpm 9+.

```bash
cd artifacts/semester-planner
npm install
npm run dev
```

## Production build

```bash
cd artifacts/semester-planner
npm install
npm run build
npm run preview
```

The production files are generated in `artifacts/semester-planner/dist`.

## Deployment

The app is a static Vite application and can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or another static hosting provider.

For the current Vercel setup, the project Root Directory is `artifacts/semester-planner` and the app-level `vercel.json` handles the Vite build and `dist` output.

## Data & privacy

Planner information is stored in the user's browser using localStorage. No server-side database is required. Use JSON Export to back up planner data and JSON Import to restore it.

## Customer customization

Replace the placeholder profile, subjects, dates, goals, and other demo content with your own information. You may modify the source code and deploy a customized copy for your own personal or organizational use under the included end-user license.

## Etsy / digital-product packaging

For an instant-download listing, package the product as a ZIP containing the `artifacts/semester-planner` source folder plus the customer guide and license. Do **not** include `node_modules`, `.git`, or local build caches.

A buyer who wants to run the source locally needs Node.js 20+ and npm 10+ (or pnpm 9+). Buyers who only need the hosted app can deploy the production build to a static hosting provider.

## AI disclosure

The interface was developed with AI-assisted tooling (including Google Stitch during the design/development process) and then reviewed and customized as part of the product workflow. If sold on Etsy, the listing should disclose AI use as required by Etsy's current Creativity Standards.

## Documentation

- [Customer User Guide](USER-GUIDE.md)
- [End-User License](LICENSE.txt)
- [Etsy Listing Draft](ETSY-LISTING.md)
- [Seller Packaging Checklist](SELLER-PACKAGING.md)

## Main files

- Application: `artifacts/semester-planner/src/App.tsx`
- Styling: `artifacts/semester-planner/src/index.css`
- PDF generation: `artifacts/semester-planner/src/pdf-export.ts`
- Vite entry: `artifacts/semester-planner/index.html`

## License

The included end-user license grants the purchaser usage and customization rights while prohibiting resale, redistribution, sublicensing, and sharing of the source package. Third-party dependencies remain under their respective licenses.
