# Plus-one sharing: no email service needed

After a successful **Yes** RSVP with a plus-one, the website shows a reminder. The employee can open their own default email app via a `mailto:` link. The draft includes the event details and direct links to the original artwork and `.ics` calendar file, **not** the registration URL. The employee selects the recipient and sends the email themselves.

The invitation card and calendar file can also be downloaded individually from the dialog and manually attached to the draft. A normal `mailto:` link cannot add attachments programmatically, and browser/OS email-app behavior varies.

No guest email is collected; no Resend integration or guest-delivery secrets are needed. The Cloudflare registration endpoint still requires the existing monday.com variables.

The calendar block currently runs 17:30–21:00 Europe/Zurich; confirm the exact end time before distributing.
