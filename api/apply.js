// api/apply.js
// Runtime: Node 18 (enforced by vercel.json)
// Parses multipart form with Busboy, uploads files to Google Drive,
// appends a row to Google Sheets, and emails (SendGrid) both the org
// and the applicant.

import { google } from 'googleapis';
import Busboy from 'busboy';
import sgMail from '@sendgrid/mail';

// --------- Env helpers ----------
function reqEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
const SENDGRID_API_KEY = reqEnv('SENDGRID_API_KEY');
const FROM_EMAIL = reqEnv('FROM_EMAIL');             // e.g. no-reply@healthmatters.clinic
const TO_EMAIL = reqEnv('TO_EMAIL');                 // e.g. executive@healthmatters.clinic
const ORIENT_URL = process.env.ORIENT_URL || 'https://www.healthmatters.clinic/orientation';
const SHEET_ID = reqEnv('GOOGLE_SHEETS_ID');
const DRIVE_FOLDER_ID = reqEnv('GOOGLE_DRIVE_FOLDER_ID');
const SA_BASE64 = reqEnv('GOOGLE_SERVICE_ACCOUNT_BASE64');

// --------- Google auth ----------
function getGoogleClients() {
  const creds = JSON.parse(Buffer.from(SA_BASE64, 'base64').toString('utf8'));
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
  ];
  const auth = new google.auth.GoogleAuth({ credentials: creds, scopes });
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });
  return { drive, sheets };
}

// --------- Multipart parser (Busboy) ----------
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = new Busboy({ headers: req.headers });
    const fields = {};
    const files = []; // { fieldname, filename, mimeType, buffer }
    const filePromises = [];

    bb.on('field', (name, val) => {
      // collect multiple checkboxes: name="skills"
      if (fields[name] === undefined) {
        fields[name] = val;
      } else if (Array.isArray(fields[name])) {
        fields[name].push(val);
      } else {
        fields[name] = [fields[name], val];
      }
    });

    bb.on('file', (fieldname, fileStream, filename, encoding, mimeType) => {
      const chunks = [];
      const p = new Promise((res, rej) => {
        fileStream.on('data', chunk => chunks.push(chunk));
        fileStream.on('limit', () => rej(new Error(`File too large: ${filename}`)));
        fileStream.on('error', rej);
        fileStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length > 0) {
            files.push({ fieldname, filename, mimeType, buffer });
          }
          res();
        });
      });
      filePromises.push(p);
    });

    bb.on('error', reject);
    bb.on('finish', async () => {
      try {
        await Promise.all(filePromises);
        resolve({ fields, files });
      } catch (e) {
        reject(e);
      }
    });

    req.pipe(bb);
  });
}

// --------- Drive upload ----------
async function uploadFilesToDrive(drive, parentFolderId, files) {
  if (!files?.length) return [];
  const links = [];
  for (const f of files) {
    const res = await drive.files.create({
      requestBody: {
        name: f.filename || `upload-${Date.now()}`,
        parents: [parentFolderId],
        mimeType: f.mimeType || 'application/octet-stream',
      },
      media: {
        mimeType: f.mimeType || 'application/octet-stream',
        body: Buffer.from(f.buffer),
      },
      fields: 'id, webViewLink',
    });
    // Make sure link is available (inherit folder permissions). If needed, you can uncomment to force share:
//  await drive.permissions.create({ fileId: res.data.id, requestBody: { role: 'reader', type: 'anyone' } });
    const id = res.data.id;
    const webViewLink = res.data.webViewLink || `https://drive.google.com/file/d/${id}/view`;
    links.push(webViewLink);
  }
  return links;
}

// --------- Sheets append ----------
async function appendRow(sheets, sheetId, row) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Submissions!A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}

// --------- SendGrid emails ----------
function initSendGrid() { sgMail.setApiKey(SENDGRID_API_KEY); }

async function emailOrg(name, email, role, city, state, links) {
  const subject = `New ${role} application — ${name}`;
  const lines = [
    `A new application was submitted.`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Role: ${role}`,
    `Location: ${city || ''}${city && state ? ', ' : ''}${state || ''}`,
    `Uploaded files: ${links && links.length ? links.join(' | ') : 'None'}`,
  ];
  const msg = {
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject,
    text: lines.join('\n'),
    html: `<pre>${lines.join('\n')}</pre>`,
  };
  await sgMail.send(msg);
}

async function emailApplicant(name, email) {
  const subject = 'Thank you for applying to serve with Health Matters Clinic';
  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <p>Dear ${name || 'Applicant'},</p>
    <p>Thank you for your interest in serving on our Board of Directors or Community Advisory Board. Your application has been received.</p>
    <p><strong>What happens next</strong></p>
    <ol>
      <li>Governance review and follow-up if anything is missing.</li>
      <li>Invitation to the next Board/CAB meeting (calendar hold sent separately).</li>
      <li>Self-paced orientation: <a href="${ORIENT_URL}">${ORIENT_URL}</a></li>
    </ol>
    <p>If you have questions, contact <a href="mailto:executive@healthmatters.clinic">executive@healthmatters.clinic</a>.</p>
    <p>Sincerely,<br/>Health Matters Clinic</p>
  </div>`;
  const msg = { to: email, from: FROM_EMAIL, subject, html, text: html.replace(/<[^>]+>/g, '') };
  await sgMail.send(msg);
}

// --------- Main handler ----------
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { drive, sheets } = getGoogleClients();
    initSendGrid();

    const { fields, files } = await parseMultipart(req);

    // Required
    const name = (fields.name || '').toString().trim();
    const email = (fields.email || '').toString().trim();
    if (!name || !email) return res.status(400).json({ ok: false, error: 'Missing name or email' });

    // Optional / structured
    const role = (fields.role || '').toString();
    const phone = (fields.phone || '').toString();
    const occupation = (fields.occupation || '').toString();
    const employer = (fields.employer || '').toString();
    const city = (fields.city || '').toString();
    const state = (fields.state || '').toString();
    const resume = (fields.resume || '').toString();
    const board_experience = (fields.board_experience || '').toString();
    const fundraising = (fields.fundraising || '').toString();
    const officer_interest = (fields.officer_interest || '').toString();
    const conflict = (fields.conflict || '').toString();
    const bio = (fields.bio || '').toString();

    // Skills can be string or array → normalize to comma list
    const skills = Array.isArray(fields.skills) ? fields.skills.join(', ') : (fields.skills || '').toString();

    // Committees: can be array (multi-select) or single value
    const committees = Array.isArray(fields.committees) ? fields.committees.join(', ') : (fields.committees || '').toString();

    // References — support either combined fields (ref1/ref2) or split (ref1_name/ref1_email)
    const ref1_name = (fields.ref1_name || '').toString() || (fields.ref1 || '').toString();
    const ref1_email = (fields.ref1_email || '').toString();
    const ref2_name = (fields.ref2_name || '').toString() || (fields.ref2 || '').toString();
    const ref2_email = (fields.ref2_email || '').toString();

    // Upload files to Drive
    const fileLinks = await uploadFilesToDrive(drive, DRIVE_FOLDER_ID, files);

    // Append a row in Sheets (match your header order)
    const now = new Date().toISOString();
    const row = [
      now, role, name, email, phone, occupation, employer, city, state, resume,
      board_experience, skills, fundraising, officer_interest, committees,
      conflict, ref1_name, ref1_email, ref2_name, ref2_email, bio,
      fileLinks.join(', ')
    ];
    await appendRow(sheets, SHEET_ID, row);

    // Notify org + applicant
    await emailOrg(name, email, role, city, state, fileLinks);
    await emailApplicant(name, email);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('apply error:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

// Vercel edge-compat: disable automatic body parsing for multipart
export const config = { api: { bodyParser: false } };
