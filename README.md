# Health Matters Clinic — Governance Guide (Vercel)

This is a minimal, buildless Vercel project that serves the Governance Guide HTML and provides a serverless backend at `/api/apply` to receive form submissions with PDF attachments and email them via SendGrid.

## Deploy
1. Create a new project in Vercel and import this repo/ZIP.
2. Add Environment Variables:
   - SENDGRID_API_KEY
   - TO_EMAIL (e.g., executive@healthmatters.clinic)
   - FROM_EMAIL (a verified sender in SendGrid)
3. Deploy. After deployment, your guide is at `/guide.html` and the endpoint is `/api/apply`.
4. In Webflow or your site, link to the hosted `/guide.html` or embed its content.

## Local test (optional)
```bash
npm i
vercel dev
```
