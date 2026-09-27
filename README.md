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

## Run locally

Requirements:
- Node.js 20+
- npm 10+ or pnpm 9+

From the `artifacts/semester-planner` folder:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `artifacts/semester-planner/dist`.

## Deploy

The app is a static Vite application and can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static hosting provider.

For Vercel, use the repository root and the included `vercel.json` configuration.

## Data & privacy

Planner information is stored in the user's browser using localStorage. No server-side database is required by the planner.

Use the built-in JSON Export feature to back up planner data and JSON Import to restore it.

## Customization

Main application code: `artifacts/semester-planner/src/App.tsx`

Main styling: `artifacts/semester-planner/src/index.css`

PDF generation: `artifacts/semester-planner/src/pdf-export.ts`

## License

See `LICENSE.txt` for the license included with this distribution.
