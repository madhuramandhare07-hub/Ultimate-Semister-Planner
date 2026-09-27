# Ultimate Semester Planner

A complete student semester planner built with React, TypeScript, Vite, and Tailwind CSS.

## Features

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
- Browser-local data storage — no database or account required

## Quick start

Requirements: Node.js 20+, npm 10+ or pnpm 9+.

From the app folder:

    cd artifacts/semester-planner
    npm install
    npm run dev

## Production build

    cd artifacts/semester-planner
    npm run build
    npm run preview

The production files are generated in `artifacts/semester-planner/dist`.

## Deploy

The app is a static Vite application and can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or another static hosting provider.

For the current Vercel setup, the project Root Directory is `artifacts/semester-planner` and the app-level `vercel.json` handles the Vite build and `dist` output.

## Data & privacy

Planner information is stored in the user's browser using localStorage. No server-side database is required by the planner. Use JSON Export to back up planner data and JSON Import to restore it.

## Documentation

- [User Guide](USER-GUIDE.md)
- [License](LICENSE.txt)

## Customization

Main application code: `artifacts/semester-planner/src/App.tsx`

Main styling: `artifacts/semester-planner/src/index.css`

PDF generation: `artifacts/semester-planner/src/pdf-export.ts`

## License

The commercial package is distributed under the included End-User License. Third-party dependencies remain under their respective licenses.
