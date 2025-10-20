# 📋 Deployment Checklist

Print this out or keep it open while setting up your application.

---

## Phase 1: Google Cloud Setup
**Estimated time: 5 minutes**

- [ ] 1.1 - Create Google Cloud project
- [ ] 1.2 - Enable Google Drive API
- [ ] 1.3 - Enable Google Sheets API
- [ ] 1.4 - Create Service Account
- [ ] 1.5 - Download service account JSON
- [ ] 1.6 - Convert JSON to base64
- [ ] 1.7 - Save base64 string somewhere safe
- [ ] 1.8 - Note the service account email address

**Service Account Email:** _________________________________

---

## Phase 2: Google Sheets Setup
**Estimated time: 3 minutes**

- [ ] 2.1 - Create new Google Sheet
- [ ] 2.2 - Rename first tab to "Submissions"
- [ ] 2.3 - Add column headers (see QUICKSTART.md)
- [ ] 2.4 - Share sheet with service account email
- [ ] 2.5 - Give service account "Editor" access
- [ ] 2.6 - Copy Sheet ID from URL

**Sheet ID:** _________________________________

**Sheet URL:** _________________________________

---

## Phase 3: Google Drive Setup
**Estimated time: 2 minutes**

- [ ] 3.1 - Create new folder in Google Drive
- [ ] 3.2 - Name it "HMC Applications" (or preferred name)
- [ ] 3.3 - Share folder with service account email
- [ ] 3.4 - Give service account "Editor" access
- [ ] 3.5 - Copy Folder ID from URL

**Folder ID:** _________________________________

**Folder URL:** _________________________________

---

## Phase 4: SendGrid Setup
**Estimated time: 3 minutes**

- [ ] 4.1 - Sign up for SendGrid account
- [ ] 4.2 - Verify your email address
- [ ] 4.3 - Create API key with "Full Access"
- [ ] 4.4 - Save API key somewhere safe (can't view again!)
- [ ] 4.5 - Set up Single Sender Verification
- [ ] 4.6 - Add FROM_EMAIL address
- [ ] 4.7 - Verify FROM_EMAIL (check inbox)

**SendGrid API Key:** _________________________________

**FROM_EMAIL:** _________________________________

**TO_EMAIL:** _________________________________

---

## Phase 5: Code Preparation
**Estimated time: 2 minutes**

- [ ] 5.1 - Download the fixed application
- [ ] 5.2 - Extract to your computer
- [ ] 5.3 - Review the files
- [ ] 5.4 - Read START_HERE.md
- [ ] 5.5 - Push to GitHub (or prepare for deployment)

**GitHub Repository:** _________________________________

---

## Phase 6: Vercel Setup
**Estimated time: 3 minutes**

- [ ] 6.1 - Sign up for Vercel account
- [ ] 6.2 - Connect GitHub account
- [ ] 6.3 - Import your repository
- [ ] 6.4 - Configure build settings (auto-detected, no changes needed)
- [ ] 6.5 - **STOP - Don't deploy yet!** Add environment variables first

---

## Phase 7: Environment Variables
**Estimated time: 2 minutes**

Add these in Vercel Project Settings → Environment Variables:

- [ ] 7.1 - Add GOOGLE_SERVICE_ACCOUNT_BASE64
  - **Value:** [base64 from Phase 1, step 1.7]

- [ ] 7.2 - Add GOOGLE_SHEETS_ID
  - **Value:** [ID from Phase 2, step 2.6]

- [ ] 7.3 - Add GOOGLE_DRIVE_FOLDER_ID
  - **Value:** [ID from Phase 3, step 3.5]

- [ ] 7.4 - Add SENDGRID_API_KEY
  - **Value:** [Key from Phase 4, step 4.4]

- [ ] 7.5 - Add FROM_EMAIL
  - **Value:** [Email from Phase 4, step 4.6]

- [ ] 7.6 - Add TO_EMAIL
  - **Value:** [Email from Phase 4, step 4.7]

- [ ] 7.7 - (Optional) Add ORIENT_URL
  - **Value:** Your orientation page URL

---

## Phase 8: Deploy
**Estimated time: 1 minute**

- [ ] 8.1 - Click "Deploy" in Vercel
- [ ] 8.2 - Wait for deployment to complete
- [ ] 8.3 - Click "Visit" to see your site

**Deployment URL:** _________________________________

---

## Phase 9: Testing
**Estimated time: 5 minutes**

Use TESTING.md for comprehensive testing, or do quick tests:

- [ ] 9.1 - Visit your deployed URL
- [ ] 9.2 - Form loads without errors
- [ ] 9.3 - Fill out form with test data
- [ ] 9.4 - Upload a test file
- [ ] 9.5 - Submit the form
- [ ] 9.6 - Success message appears
- [ ] 9.7 - Check Google Sheet for new row
- [ ] 9.8 - Check Google Drive for uploaded file
- [ ] 9.9 - Check TO_EMAIL inbox for notification
- [ ] 9.10 - Check applicant email for confirmation

**All tests passed?** [ ] Yes [ ] No

**Issues found:** _________________________________

_________________________________

---

## Phase 10: Verification
**Estimated time: 2 minutes**

- [ ] 10.1 - Test in another browser (Chrome, Firefox, Safari)
- [ ] 10.2 - Test on mobile device
- [ ] 10.3 - Review data in Google Sheet
- [ ] 10.4 - Verify file permissions in Drive
- [ ] 10.5 - Check email formatting

---

## Phase 11: Go Live!
**Estimated time: 1 minute**

- [ ] 11.1 - Share URL with stakeholders
- [ ] 11.2 - Add link to website
- [ ] 11.3 - Monitor first few submissions
- [ ] 11.4 - Set up Google Drive notifications (optional)
- [ ] 11.5 - Bookmark Google Sheet for easy access

---

## Post-Deployment

### Monitor (First 24 Hours)
- [ ] Check for Vercel function errors
- [ ] Review submission quality
- [ ] Confirm emails are being delivered
- [ ] Verify file uploads working consistently

### Maintenance
- [ ] Check Google Drive storage monthly
- [ ] Review Google Sheets data structure
- [ ] Monitor SendGrid email delivery rates
- [ ] Update form fields if needed

---

## 🎉 Completion

**Deployment completed by:** _________________________________

**Date:** _________________________________

**Total time:** _______ minutes

**Status:** [ ] Success [ ] Issues (see notes)

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Quick Reference

**Important URLs:**
- Live Application: _________________________________
- Google Sheet: _________________________________
- Google Drive Folder: _________________________________
- Vercel Dashboard: https://vercel.com/dashboard
- SendGrid Dashboard: https://app.sendgrid.com/

**Support:**
- Vercel Docs: https://vercel.com/docs
- SendGrid Docs: https://docs.sendgrid.com/
- Google Cloud Docs: https://cloud.google.com/docs

**Project Contacts:**
- Email: executive@healthmatters.clinic
- Phone: (404) 904-6355
