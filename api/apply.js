import Busboy from 'busboy';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const config = { api: { bodyParser: false } };

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const files = [];

    busboy.on('file', (name, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', (d) => chunks.push(d));
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length > 0) {
          files.push({
            field: name,
            filename: filename || 'upload.pdf',
            mime: mimeType || 'application/pdf',
            buffer
          });
        }
      });
    });

    busboy.on('field', (name, val) => { fields[name] = val; });
    busboy.on('error', reject);
    busboy.on('finish', () => resolve({ fields, files }));
    req.pipe(busboy);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseMultipart(req);

    // Honeypot
    if (fields.website && fields.website.trim() !== '') {
      return res.status(200).json({ ok: true });
    }

    const required = ['name', 'email', 'role'];
    for (const r of required) {
      if (!fields[r] || !String(fields[r]).trim()) {
        return res.status(400).json({ ok: false, error: `Missing ${r}` });
      }
    }

    const text = [
      'New Governance Application',
      '--------------------------',
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      `Phone: ${fields.phone || ''}`,
      `Role: ${fields.role}`,
      `Resume/LinkedIn: ${fields.resume || ''}`,
      '',
      'Bio / Why serve:',
      `${fields.bio || ''}`
    ].join('\n');

    const attachments = files.slice(0, 3).map(f => ({
      filename: f.filename,
      type: f.mime,
      content: f.buffer.toString('base64'),
      disposition: 'attachment'
    }));

    await sgMail.send({
      to: process.env.TO_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `HMC Application: ${fields.role} — ${fields.name}`,
      text,
      attachments
    });

    return res.status(200).json({ ok: true, message: 'Submitted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
