// api/apply.js
// Requires env vars (in Vercel Project → Settings → Environment Variables):
// GOOGLE_SERVICE_ACCOUNT_BASE64, GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SHEETS_ID,
// SENDGRID_API_KEY, FROM_EMAIL (e.g., no-reply@healthmatters.clinic), TO_EMAIL (executive@...),
// ORIENT_URL (optional; defaults to https://www.healthmatters.clinic/orientation)

import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'node:fs';
import sgMail from '@sendgrid/mail';

export const config = {
  api: { bodyParser: false }, // let formidable handle multipart
};

// ----- ENV HELPERS -----
function reqEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const SHEET_ID = reqEnv('GOOGLE_SHEETS_ID');
const DRIVE_FOLDER_ID = reqEnv('GOOGLE_DRIVE_FOLDER_ID');
const SA_BASE64 = reqEnv('GOOGLE_SERVICE_ACCOUNT_BASE64');
const SENDGRID_API_KEY = reqEnv('SENDGRID_API_KEY');
const FROM_EMAIL = reqEnv('FROM_EMAIL');
const TO_EMAIL = reqEnv('TO_EMAIL');
const ORIENT_URL = process.env.ORIENT_URL || 'https://www.healthmatters.clinic/orientation';

// ----- GOOGLE CLIENTS -----
function getGoogleClients() {
  const creds = JSON.parse(Buffer.from(SA_BASE64, 'base64').toString('utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });
  return { drive, sheets };
}

// ----- MULTIPART PARSE (formidable) -----
function parseForm(req) {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 25 * 1024 * 1024, // 25MB per file
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

// ----- DRIVE UPLOAD -----
async function uploadFilesToDrive(drive, parentFolderId, filesObj) {
  const uploads = [];
  const entries = Object.entries(filesObj || {});
  for (const [, fileOrList] of entries) {
    const list = Array.isArray(fileOrList) ? fileOrList : [fileOrList];
    for (const f of list) {
      if (!f || !f.filepath || !f.originalFilename) continue;
      try {
        const media = {
          mimeType: f.mimetype || 'application/octet-stream',
          body: fs.createReadStream(f.filepath),
        };
        const res = await drive.files.create({
          requestBody: { name: f.originalFilename, parents: [parentFolderId] },
          media,
          fields: 'id,name,webViewLink',
        });
        uploads.push(res.data);
        // cleanup tmp
        try { fs.unlinkSync(f.filepath); } catch {}
      } catch (uploadErr) {
        console.error(`Failed to upload ${f.originalFilename}:`, uploadErr);
        // Continue with other files even if one fails
      }
    }
  }
  return uploads;
}

// ----- SHEETS APPEND -----
async function appendRow(sheets, spreadsheetId, row) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Submissions!A1',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

// ----- EMAILS (SendGrid) -----
function initSendGrid() { sgMail.setApiKey(SENDGRID_API_KEY); }

async function emailOrg({ name, email, role, city, state, links }) {
  const subject = `New ${role || 'Board/CAB'} application — ${name}`;
  const text = [
    `A new application was submitted.`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Role: ${role || ''}`,
    `Location: ${[city, state].filter(Boolean).join(', ')}`,
    `Files: ${links?.length ? links.join(' | ') : 'None'}`,
  ].join('\n');

  await sgMail.send({
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject,
    text,
    html: `<pre>${text}</pre>`,
  });
}

async function emailApplicant({ name, email, role }) {
  const subject = 'We received your application — Health Matters Clinic';
  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <p>Dear ${name || 'Applicant'},</p>
    <p>Thank you for your interest in serving on our ${role || 'Board/CAB'}. Your application has been received.</p>
    <p><strong>Next steps</strong></p>
    <ol>
      <li>Governance review and follow-up if anything is missing.</li>
      <li>Invitation to the next Board/CAB meeting (calendar hold sent separately).</li>
      <li>Self-paced orientation: <a href="${ORIENT_URL}">${ORIENT_URL}</a></li>
    </ol>
    <p>If you have questions, contact <a href="mailto:executive@healthmatters.clinic">executive@healthmatters.clinic</a>.</p>
    <p>Sincerely,<br/>Health Matters Clinic</p>
  </div>`;
  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, ''),
  });
}

// ----- MAIN HANDLER -----
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { drive, sheets } = getGoogleClients();
    initSendGrid();

    const { fields, files } = await parseForm(req);

    // required fields
    const name = (fields.name || '').toString().trim();
    const email = (fields.email || '').toString().trim();
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Missing name or email' });
    }

    // normalize helpers
    const get = (k) => Array.isArray(fields[k]) ? fields[k][0]?.toString() || '' : (fields[k]?.toString() || '');
    const csv = (v) => Array.isArray(v) ? v.map(x => x?.toString() || '').filter(Boolean).join(', ') : (v?.toString() || '');

    // collect fields
    const role = get('role');
    const phone = get('phone');
    const occupation = get('occupation');
    const employer = get('employer');
    const city = get('city');
    const state = get('state');
    const resume = get('resume');
    const board_experience = get('board_experience');
    const fundraising = get('fundraising');
    const officer_interest = get('officer_interest');
    const conflict = get('conflict');
    const bio = get('bio');
    const skills = csv(fields.skills);
    const committees = csv(fields.committees);

    // references (separate inputs recommended)
    const ref1_name = get('ref1_name') || get('ref1'); // accepts combined if still present
    const ref1_email = get('ref1_email');
    const ref2_name = get('ref2_name') || get('ref2');
    const ref2_email = get('ref2_email');

    // upload files to Drive
    const uploads = await uploadFilesToDrive(drive, DRIVE_FOLDER_ID, files);
    const fileLinks = uploads.map(u => u.webViewLink || `https://drive.google.com/file/d/${u.id}/view`);

    // append a row to Sheets (order aligned to your headers)
    const now = new Date().toISOString();
    const row = [
      now, role, name, email, phone,
      occupation, employer, city, state,
      resume, board_experience, skills, fundraising, officer_interest,
      committees, conflict,
      ref1_name, ref1_email, ref2_name, ref2_email,
      bio, fileLinks.join(', ')
    ];
    await appendRow(sheets, SHEET_ID, row);

    // send emails
    await emailOrg({ name, email, role, city, state, links: fileLinks });
    await emailApplicant({ name, email, role });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('apply error:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
