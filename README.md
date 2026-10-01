# Christmas Party 2026 — GitHub + Cloudflare + monday.com

A small Christmas-party RSVP site using:
- GitHub for source control
- Cloudflare Pages for hosting
- Cloudflare Pages Functions for the form endpoint
- monday.com GraphQL API for registrations

## Project structure

- `public/index.html` — page
- `public/style.css` — design
- `public/app.js` — form submission and +1 field logic
- `functions/api/register.js` — server-side form handler

Cloudflare Pages Functions use the `/functions` directory for server-side routes.

## 1. Test the page locally

You can preview the static page directly, but the `/api/register` endpoint needs Cloudflare's runtime.

Using Wrangler:

```bash
npx wrangler pages dev public
```

## 2. Create your GitHub repository

Create an empty repository and push this project.

Example:

```bash
git init
git add .
git commit -m "Initial Christmas party website"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 3. Connect the repository to Cloudflare

In Cloudflare:
- Workers & Pages
- Create application
- Connect to Git
- Select this GitHub repository
- Production branch: `main`
- Build command: none
- Build output directory: `public`

## 4. monday.com board mapping used in this version

This version already uses the following monday.com column IDs:

- Name (item name) → `name`
- Status → `color_mm7q3wsc`
- Dietary requirements → `text_mm7qpayv`
- Notes → `long_text_mm7q2xpt` (only additional notes)
- Registered → `date_mm7qz3mx`
- +1? (checkbox) → `boolean_mm7qnsws`
- Partner's name (text) → `text_mm7qrs2s`

The optional spouse / +1 is stored in its own columns. No email address is collected or sent.

## 5. Add Cloudflare secrets

In your Cloudflare Pages project, add these environment variables/secrets:

- `MONDAY_API_TOKEN` — keep this secret
- `MONDAY_BOARD_ID` — use `5105282236`
- `MONDAY_GROUP_ID` — optional

Do NOT put the monday API token in HTML or browser JavaScript.

## 6. Current form behavior

- Required fields: first name, last name, attendance
- Attendance status is stored in monday.com Status
- Dietary checkboxes are combined into a single text value for monday.com
- Users can optionally bring one spouse / +1
- If a +1 is selected, the guest name becomes required
- A checked +1 checkbox and the partner name are saved to their own monday columns
- Registrations are allowed multiple times (duplicates are not blocked)
- If monday.com is not configured, the endpoint returns a clear error instead of a success message

## 7. Customize the party

Before publishing, update:
- Date
- Time
- Venue
- Program
- Company/event name
- RSVP deadline
- Any final dietary options
- Later: visual design / hero image

## Minimal design with motion

- Artwork is included at `public/assets/jks-christmas-hero.png`.
- The page contains only the invitation, essential event details and the RSVP form.
- Motion: subtle image entrance, animated star, intersection-based section reveal and guest-field reveal.
- `prefers-reduced-motion` is respected; form submissions and monday.com mapping are unchanged.
- Visible date/time/location reflect current planning and should be verified before inviting everyone.
