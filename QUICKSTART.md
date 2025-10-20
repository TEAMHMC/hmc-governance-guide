# Quick Start Guide

## 🚀 Deploy in 15 Minutes

### Step 1: Google Cloud Setup (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable APIs:
   - [Enable Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
   - [Enable Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
4. Create Service Account:
   - Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Click "Create Service Account"
   - Name it "hmc-app-service" → Create
   - Grant "Editor" role → Continue → Done
   - Click on the service account → Keys → Add Key → Create New Key → JSON
   - Download the JSON file

5. Convert to base64:
   ```bash
   cat service-account.json | base64 -w 0 > credentials.txt
   ```
   Copy the contents of `credentials.txt`

### Step 2: Google Sheet Setup (3 min)

1. Create a [new Google Sheet](https://sheets.google.com/)
2. Rename the first tab to "Submissions"
3. Add these headers in row 1:
   ```
   Timestamp	Role	Name	Email	Phone	Occupation	Employer	City	State	Resume URL	Board Experience	Skills	Fundraising	Officer Interest	Committee Interests	Conflict Disclosure	Ref 1 Name	Ref 1 Email	Ref 2 Name	Ref 2 Email	Statement	File Links
   ```
4. Share with your service account email (find it in the service-account.json file: `client_email` field)
   - Click Share → Paste email → Give "Editor" access
5. Copy Sheet ID from URL: `https://docs.google.com/spreadsheets/d/[COPY_THIS_PART]/edit`

### Step 3: Google Drive Setup (2 min)

1. Create a [new folder in Drive](https://drive.google.com/)
2. Name it "HMC Applications"
3. Share with your service account email (same as above)
   - Right-click folder → Share → Paste email → Give "Editor" access
4. Copy Folder ID from URL: `https://drive.google.com/drive/folders/[COPY_THIS_PART]`

### Step 4: SendGrid Setup (3 min)

1. [Sign up for SendGrid](https://signup.sendgrid.com/)
2. Verify your email address
3. Create API Key:
   - Settings → [API Keys](https://app.sendgrid.com/settings/api_keys) → Create API Key
   - Name it "HMC App" → Full Access → Create & View
   - **COPY THE KEY NOW** (you can't see it again!)
4. Verify sender email:
   - Settings → [Sender Authentication](https://app.sendgrid.com/settings/sender_auth) → Single Sender Verification
   - Add `no-reply@healthmatters.clinic`
   - Verify the email by clicking the link sent to that address

### Step 5: Deploy to Vercel (2 min)

#### Option A: Using Vercel Dashboard
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Click "Import Project" → Import from GitHub
4. Select your repository
5. Add Environment Variables:
   ```
   GOOGLE_SERVICE_ACCOUNT_BASE64 = [paste from step 1]
   GOOGLE_SHEETS_ID = [paste from step 2]
   GOOGLE_DRIVE_FOLDER_ID = [paste from step 3]
   SENDGRID_API_KEY = [paste from step 4]
   FROM_EMAIL = no-reply@healthmatters.clinic
   TO_EMAIL = executive@healthmatters.clinic
   ```
6. Click Deploy

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables
vercel env add GOOGLE_SERVICE_ACCOUNT_BASE64 production
vercel env add GOOGLE_SHEETS_ID production
vercel env add GOOGLE_DRIVE_FOLDER_ID production
vercel env add SENDGRID_API_KEY production
vercel env add FROM_EMAIL production
vercel env add TO_EMAIL production

# Redeploy with env vars
vercel --prod
```

### Step 6: Test (2 min)

1. Visit your deployed URL
2. Fill out the application form
3. Submit with a test file
4. Check:
   - ✅ Success message appears
   - ✅ Data in Google Sheet
   - ✅ File in Google Drive
   - ✅ Email received

## 🎉 You're Done!

Your application is now live at: `https://your-project.vercel.app`

---

## ⚡ Local Development

Want to test locally first?

```bash
# Clone the repository
git clone [your-repo-url]
cd hmc-app

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local

# Install Vercel CLI
npm install -g vercel

# Start development server
vercel dev

# Visit http://localhost:3000
```

---

## 🆘 Troubleshooting

### "Missing env: GOOGLE_SHEETS_ID"
→ You forgot to add environment variables in Vercel. Go to Project Settings → Environment Variables

### "Permission denied" on Google APIs
→ You didn't share the Sheet/Drive folder with your service account email

### "401 Unauthorized" from SendGrid
→ Your API key is wrong or sender email isn't verified

### Form submission fails
→ Check browser console for errors. Check Vercel Function logs in dashboard.

### Files not uploading
→ Check file size (must be under 25MB). Check Drive storage quota.

---

## 📱 Support

Need help? Contact:
- **Email**: executive@healthmatters.clinic
- **Phone**: (404) 904-6355

---

## 📚 More Information

- Full documentation: See `README.md`
- Detailed fixes: See `FIXES.md`
- Environment template: See `.env.example`
