// api/apply.js
// Runtime: Node 18+ (Vercel). Requires envs set in Vercel.
// GOOGLE_SERVICE_ACCOUNT_BASE64, GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SHEETS_ID,
// SENDGRID_API_KEY, FROM_EMAIL, TO_EMAIL

import Busboy from 'busboy';
import { google } from 'googleapis';

export const config = { api: { bodyParser: false } };

function getEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function getGoogleClients() {
  const keyB64 = getEnv('GOOGLE_SERVICE_ACCOUNT_BASE64');
  const key = JSON.parse(Buffer.from(keyB64, 'base64').toString('utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ],
  });
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });
  return { drive, sheets };
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const files = [];

    busboy.on('field', (name, val) => { fields[name] = val; });

    busboy.on('file', (name, file, info) => {
      const chunks = [];
      file.on('data', (d) => chunks.push(d));
      file.on('end', () => files.push({
        fieldname: name,
        filename: info.filename,
        mimeType: info.mimeType,
        buffer: Buffer.concat(chunks),
      }));
    });

    busboy.on('error', reject);
    busboy.on('finish', () => resolve({ fields, files }));

    req.pipe(busboy);
  });
}

async function uploadFilesToDrive(drive, parentFolderId, files) {
  const results = [];
  for (const f of files) {
    if (!f.filename || !f.buffer?.length) continue;
    const res = await drive.files.create({
      requestBody: {
        name: f.filename,
        parents: [parentFolderId],
      },
      media: {
        mimeType: f.mimeType || 'application/octet-stream',
        body: Buffer.from(f.buffer),
      },
      fields: 'id,name,webViewLink,webContentLink',
    });
    results.push(res.data);
  }
  return results;
}

async function appendSubmissionRow(sheets, spreadsheetId, row) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Submissions!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

async function sendEmail(name, email) {
  const apiKey = getEnv('SENDGRID_API_KEY');
  const fromEmail = getEnv('FROM_EMAIL');
  const toEmail = getEnv('TO_EMAIL');

  const payload = {
    personalizations: [{ to: [{ email: toEmail }] }],
    from: { email: fromEmail, name: 'HMC Governance' },
    subject: `New Board/CAB Application: ${name}`,
    content: [{
      type: 'text/plain',
      value: `Applicant: ${name}\nEmail: ${email}\nSee Google Sheet for full details.`,
    }],
  };

  const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SendGrid error ${resp.status}: ${text}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { fields, files } = await parseMultipart(req);
    const name = fields.name || '';
    const email = fields.email || '';
    if (!name || !email) return res.status(400).json({ ok: false, error: 'Missing name or email' });

    const folderId = getEnv('GOOGLE_DRIVE_FOLDER_ID');
    const sheetId = getEnv('GOOGLE_SHEETS_ID');

    const { drive, sheets } = await getGoogleClients();

    // 1) Upload any files
    const uploads = await uploadFilesToDrive(drive, folderId, files);

    // 2) Append a row
    const now = new Date().toISOString();
    const fileLinks = uploads.map(u => u.webViewLink || `https://drive.google.com/file/d/${u.id}/view`).join(', ');
    const skills = Array.isArray(fields.skills) ? fields.skills.join(', ') : (fields.skills || '');

    const row = [
      now,
      fields.role || '',
      name,
      email,
      fields.phone || '',
      fields.resume || '',
      fields.board_experience || '',
      skills,
      fields.ref1_name || '',
      fields.ref1_email || '',
      fields.ref2_name || '',
      fields.ref2_email || '',
      fileLinks
    ];
    await appendSubmissionRow(sheets, sheetId, row);

    // 3) Notify via email
    await sendEmail(name, email);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('apply error:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
