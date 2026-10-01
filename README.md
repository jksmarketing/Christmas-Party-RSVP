# Christmas Party 2026 — GitHub + Cloudflare + monday.com

A small Christmas-party RSVP site using:
- GitHub for source control
- Cloudflare Pages for hosting
- Cloudflare Pages Functions for the form endpoint
- monday.com GraphQL API for registrations

## Project structure

- `public/index.html` — page
- `public/style.css` — design
- `public/app.js` — form submission
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

## 4. Create the monday.com board

A simple board could have:

- Name (item name)
- Email
- Attendance
- Dietary requirements
- Notes
- Registered at

The exact column IDs are needed for the API mapping.

## 5. Add Cloudflare secrets

In your Cloudflare Pages project, add these environment variables/secrets:

- `MONDAY_API_TOKEN` — keep this secret
- `MONDAY_BOARD_ID`
- `MONDAY_GROUP_ID` — optional

Do NOT put the monday API token in HTML or browser JavaScript.

## 6. Finish the monday mapping

Open `functions/api/register.js` and replace the example `columnValues` mapping with the real monday column IDs.

For example:

```js
const columnValues = {
  email_column_id: { email: email, text: email },
  attendance_column_id: { label: attendance },
  dietary_column_id: dietary.join(", "),
  notes_column_id: notes
};
```

The exact format depends on the column types in your monday board.

## 7. Customize the party

Before publishing, update:
- Date
- Time
- Venue
- Program
- Company/event name
- RSVP deadline
- Dietary questions
- Any plus-one / activity / Secret Santa questions
