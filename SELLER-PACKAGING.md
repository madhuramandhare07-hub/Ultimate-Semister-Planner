# Seller Packaging Checklist

Use this checklist before uploading the product to Etsy.

## Include

- `artifacts/semester-planner/` application source
- `README.md`
- `USER-GUIDE.md`
- `LICENSE.txt`
- `ETSY-LISTING.md`
- `vercel.json` if the buyer is expected to use the included Vercel configuration

## Exclude

- `.git/`
- `node_modules/`
- local IDE/editor folders
- operating-system cache files
- temporary build caches
- private credentials or environment files
- unrelated development experiments

## Pre-upload quality check

1. Run `npm install`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Open the production build locally with `npm run preview`.
5. Test navigation on desktop and mobile.
6. Test JSON export/import.
7. Test personalized and blank PDF export.
8. Test the reset flow.
9. Verify the placeholder profile contains no personal information.
10. Confirm the ZIP opens cleanly on a second machine/account.
11. Confirm the listing screenshots match the actual product.
12. Confirm the Etsy listing discloses AI assistance where required.

## Delivery format

Etsy currently allows up to five digital files for an instant-download listing, with a maximum of 20 MB per file. A ZIP is a practical way to bundle the source and documentation into one downloadable file.
