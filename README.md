# Health Matters Clinic - Governance Application System

## 📋 Overview
This is a web application for Health Matters Clinic's Board of Directors and Community Advisory Board application process. It includes:
- Static HTML application form
- Vercel serverless function for form processing
- Integration with Google Drive (file uploads), Google Sheets (data storage), and SendGrid (email notifications)

## 🔧 Issues Fixed

### 1. **Missing CORS Headers**
   - **Problem**: API might reject frontend requests due to CORS policy
   - **Fix**: Added CORS headers to the API response
   - **Impact**: Allows the form to properly communicate with the API

### 2. **Improved Error Handling**
   - **Problem**: Single file upload failure would crash entire submission
   - **Fix**: Added try-catch around individual file uploads
   - **Impact**: Submission continues even if one file fails to upload

### 3. **OPTIONS Request Handling**
   - **Problem**: Browsers send preflight OPTIONS requests that weren't handled
   - **Fix**: Added OPTIONS method handler
   - **Impact**: Prevents CORS-related errors in modern browsers

### 4. **Better Error Logging**
   - **Problem**: Errors weren't detailed enough for debugging
   - **Fix**: Enhanced error messages with specific details
   - **Impact**: Easier troubleshooting in production

## 📁 Project Structure

```
hmc-app/
├── api/
│   └── apply.js          # Serverless function for form processing
├── index.html            # Main landing page
├── guide.html            # Alternative version with full documentation
├── package.json          # Node.js dependencies
├── vercel.json           # Vercel deployment configuration
└── README.md            # This file
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 20.x or higher
- Vercel account (for deployment)
- Google Cloud Platform account (for Drive & Sheets API)
- SendGrid account (for email notifications)

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Cloud Setup

#### A. Create a Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Google Drive API
   - Google Sheets API
4. Create a Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Grant "Editor" role
   - Create a JSON key and download it

#### B. Prepare Service Account Credentials
```bash
# Convert your service account JSON to base64
cat service-account.json | base64 -w 0 > service-account-base64.txt
```

#### C. Create Google Sheet
1. Create a new Google Sheet
2. Add a sheet tab named "Submissions"
3. Add headers in row 1:
   ```
   Timestamp | Role | Name | Email | Phone | Occupation | Employer | City | State | Resume URL | Board Experience | Skills | Fundraising | Officer Interest | Committee Interests | Conflict Disclosure | Ref 1 Name | Ref 1 Email | Ref 2 Name | Ref 2 Email | Statement | File Links
   ```
4. Share the sheet with your service account email (found in the JSON)
5. Copy the Sheet ID from the URL (between `/d/` and `/edit`)

#### D. Create Google Drive Folder
1. Create a folder in Google Drive for uploads
2. Share it with your service account email
3. Copy the Folder ID from the URL

### 3. SendGrid Setup

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key:
   - Settings → API Keys → Create API Key
   - Give it "Full Access" permissions
3. Verify a sender email address:
   - Settings → Sender Authentication → Single Sender Verification

### 4. Environment Variables

Create a `.env.local` file for local development or configure in Vercel:

```bash
# Google Service Account (base64 encoded JSON)
GOOGLE_SERVICE_ACCOUNT_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50I...

# Google Sheets ID (from the URL)
GOOGLE_SHEETS_ID=1234567890abcdefghijklmnopqrstuvwxyz

# Google Drive Folder ID (from the URL)
GOOGLE_DRIVE_FOLDER_ID=1234567890abcdefghijklmnopqrstuvwxyz

# SendGrid API Key
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email addresses
FROM_EMAIL=no-reply@healthmatters.clinic
TO_EMAIL=executive@healthmatters.clinic

# Optional: Orientation URL (defaults to shown value if not set)
ORIENT_URL=https://www.healthmatters.clinic/orientation
```

### 5. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add GOOGLE_SERVICE_ACCOUNT_BASE64
vercel env add GOOGLE_SHEETS_ID
vercel env add GOOGLE_DRIVE_FOLDER_ID
vercel env add SENDGRID_API_KEY
vercel env add FROM_EMAIL
vercel env add TO_EMAIL
```

#### Option B: Vercel Dashboard
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the repository in Vercel
3. Add environment variables in:
   - Project Settings → Environment Variables
4. Deploy

### 6. Local Development

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Start development server
vercel dev
```

Visit `http://localhost:3000` to test locally.

## 🧪 Testing the Application

### Test Checklist
- [ ] Form loads without errors
- [ ] All form fields are present
- [ ] File uploads work (test with PDF and images)
- [ ] Form validation works (try submitting without required fields)
- [ ] Successful submission shows success message
- [ ] Data appears in Google Sheet
- [ ] Files appear in Google Drive folder
- [ ] Organization receives notification email
- [ ] Applicant receives confirmation email

### Manual Test
1. Fill out the form completely
2. Upload test files
3. Submit the form
4. Check:
   - Console for any errors
   - Google Sheet for new row
   - Google Drive for uploaded files
   - Email inboxes for notifications

## 🐛 Troubleshooting

### Common Issues

#### 1. "Missing env: [VARIABLE_NAME]"
- **Cause**: Environment variable not set
- **Fix**: Add the missing variable in Vercel dashboard or `.env.local`

#### 2. "Permission denied" errors with Google APIs
- **Cause**: Service account doesn't have access
- **Fix**: 
  - Share the Google Sheet with service account email
  - Share the Google Drive folder with service account email
  - Ensure APIs are enabled in Google Cloud Console

#### 3. SendGrid emails not sending
- **Cause**: Sender email not verified
- **Fix**: Verify sender email in SendGrid dashboard

#### 4. Form submission fails with CORS error
- **Cause**: Missing or incorrect CORS headers
- **Fix**: The updated code includes CORS headers; redeploy if using old version

#### 5. File uploads fail
- **Cause**: File too large or wrong format
- **Fix**: 
  - Check file size limit (25MB per file)
  - Verify file format is accepted
  - Check Google Drive storage quota

#### 6. "Cannot read property 'filepath'" error
- **Cause**: formidable version compatibility issue
- **Fix**: Ensure formidable version is 3.5.4 or higher

## 📊 Google Sheets Headers

The Google Sheet must have these exact headers in the first row of the "Submissions" tab:

| Column | Header |
|--------|--------|
| A | Timestamp |
| B | Role |
| C | Name |
| D | Email |
| E | Phone |
| F | Occupation |
| G | Employer |
| H | City |
| I | State |
| J | Resume URL |
| K | Board Experience |
| L | Skills |
| M | Fundraising |
| N | Officer Interest |
| O | Committee Interests |
| P | Conflict Disclosure |
| Q | Ref 1 Name |
| R | Ref 1 Email |
| S | Ref 2 Name |
| T | Ref 2 Email |
| U | Statement |
| V | File Links |

## 🔒 Security Considerations

1. **Service Account**: Store base64-encoded credentials securely in environment variables
2. **API Keys**: Never commit API keys to version control
3. **File Uploads**: Current limit is 25MB per file; adjust as needed
4. **Honeypot**: Form includes hidden honeypot field to reduce spam
5. **Rate Limiting**: Consider adding rate limiting for production use
6. **HTTPS**: Always use HTTPS in production (automatic with Vercel)

## 📝 API Response Format

### Success Response
```json
{
  "ok": true
}
```

### Error Response
```json
{
  "ok": false,
  "error": "Error message description"
}
```

## 🎨 Customization

### Modifying Form Fields
1. Update the HTML form in `index.html` or `guide.html`
2. Update the field extraction in `api/apply.js` (lines 169-194)
3. Update the row array in `api/apply.js` (lines 203-210)
4. Update Google Sheets headers to match

### Changing Email Templates
- Organization email: Lines 115-125 in `api/apply.js`
- Applicant email: Lines 128-145 in `api/apply.js`

### Adjusting File Upload Limits
- Modify `maxFileSize` in `api/apply.js` (line 54)

## 📞 Support

For questions or issues:
- **Email**: executive@healthmatters.clinic
- **Phone**: (404) 904-6355

## 📄 License

© 2025 Health Matters Clinic • All Rights Reserved
