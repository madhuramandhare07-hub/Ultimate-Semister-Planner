# Ultimate Semester Planner — User Guide

## What this product does

A browser-based student planner for organizing a semester in one place: planning, tracking, study progress, habits, grades, revision, notes, important dates, reflection, JSON backup, and PDF export.

## Quick start

1. Open the deployed website or run the project locally.
2. Open **My Profile** and replace the sample student information.
3. Add subjects and current progress.
4. Add goals, assignments, exams, and important dates.
5. Fill the timetable and weekly/daily plans.
6. Use the trackers during the semester.
7. Export JSON regularly for backup.
8. Use **Print Planner** or PDF export for a printable copy.

## Backup and restore

Use **Export** to download planner data as JSON and **Import** to restore it. Because data is stored in the browser, clearing browser/site data can remove the current planner. Keep a backup.

## PDF

- **Personalized PDF:** uses current planner data.
- **Blank PDF:** creates a clean printable planner without sample data.

## Local installation

Requirements: Node.js 20+, npm 10+ or pnpm 9+.

From `artifacts/semester-planner`:

    npm install
    npm run dev

For production:

    npm run build
    npm run preview

## Important

The first-load information is placeholder data. Replace it before using the planner for real academic records.

The application does not require a backend database or account. Planner data is kept in browser local storage.
