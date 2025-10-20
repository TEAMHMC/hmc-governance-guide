# Testing Checklist

Use this checklist to verify your application is working correctly before going live.

## Pre-Deployment Tests

### Google Cloud Configuration
- [ ] Service account created
- [ ] Drive API enabled
- [ ] Sheets API enabled
- [ ] Service account JSON downloaded
- [ ] JSON converted to base64
- [ ] Service account email identified

### Google Sheets
- [ ] Sheet created
- [ ] "Submissions" tab exists
- [ ] Headers added in correct order
- [ ] Sheet shared with service account (Editor access)
- [ ] Sheet ID copied

### Google Drive
- [ ] Folder created
- [ ] Folder shared with service account (Editor access)
- [ ] Folder ID copied

### SendGrid
- [ ] Account created
- [ ] API key generated (Full Access)
- [ ] Sender email verified
- [ ] API key saved securely

### Vercel/Local Environment
- [ ] All environment variables set:
  - [ ] GOOGLE_SERVICE_ACCOUNT_BASE64
  - [ ] GOOGLE_SHEETS_ID
  - [ ] GOOGLE_DRIVE_FOLDER_ID
  - [ ] SENDGRID_API_KEY
  - [ ] FROM_EMAIL
  - [ ] TO_EMAIL
- [ ] Project deployed (or running locally)

---

## Functional Tests

### Test 1: Page Load
- [ ] Home page loads without errors
- [ ] No console errors
- [ ] Form is visible
- [ ] All tabs work (if using guide.html)
- [ ] Navigation buttons work

### Test 2: Form Validation
- [ ] Required field validation works
- [ ] Can't submit without name
- [ ] Can't submit without email
- [ ] Email format validation works
- [ ] Phone number field accepts input

### Test 3: Form Fields
- [ ] All text inputs work
- [ ] Dropdowns populate correctly
- [ ] Checkboxes can be selected
- [ ] Multi-select works (hold Ctrl/Cmd)
- [ ] Textareas accept input
- [ ] File upload buttons open file picker

### Test 4: File Uploads
#### Test with PDF
- [ ] Can select PDF file
- [ ] File name appears after selection
- [ ] Can upload PDF under 25MB
- [ ] PDF appears in Google Drive after submission

#### Test with Image
- [ ] Can select image file (JPG, PNG)
- [ ] Image name appears after selection
- [ ] Can upload image under 25MB
- [ ] Image appears in Google Drive after submission

#### Test with Multiple Files
- [ ] Can upload multiple different files
- [ ] All files appear in Google Drive
- [ ] File links recorded in Google Sheet

#### Test Edge Cases
- [ ] Try uploading file over 25MB (should fail gracefully)
- [ ] Try unsupported file type (should work or fail gracefully)
- [ ] Submit without any files (should still work)

### Test 5: Form Submission
- [ ] Click submit button
- [ ] Form shows processing state (if implemented)
- [ ] Success message appears
- [ ] Form resets after successful submission
- [ ] No console errors

### Test 6: Google Sheets Integration
- [ ] New row added to "Submissions" tab
- [ ] Timestamp is correct
- [ ] All form fields recorded correctly
- [ ] Skills recorded as comma-separated list
- [ ] Committee interests recorded correctly
- [ ] File links are clickable URLs
- [ ] Multiple submissions create multiple rows

### Test 7: Google Drive Integration
- [ ] Files uploaded to correct folder
- [ ] File names preserved
- [ ] Files viewable (click link in Sheet)
- [ ] Files have correct permissions
- [ ] Multiple submissions don't overwrite files

### Test 8: Email Notifications

#### Organization Email
- [ ] Email received at TO_EMAIL address
- [ ] Subject line correct: "New [Role] application — [Name]"
- [ ] Email contains applicant name
- [ ] Email contains applicant email
- [ ] Email contains role selection
- [ ] Email contains location (city, state)
- [ ] Email contains file links (if files uploaded)
- [ ] Email sent from correct FROM_EMAIL

#### Applicant Email
- [ ] Email received at applicant's email
- [ ] Subject line correct: "We received your application — Health Matters Clinic"
- [ ] Email personalized with applicant name
- [ ] Email contains role applied for
- [ ] Email contains next steps
- [ ] Orientation link is correct
- [ ] Contact information is correct

### Test 9: Error Handling
- [ ] Submit with missing required fields (shows error)
- [ ] Submit with invalid email format (shows error)
- [ ] Test with network disconnected (shows error)
- [ ] Error message is user-friendly
- [ ] Can recover from error and resubmit

### Test 10: Honeypot Anti-Spam
- [ ] Hidden field exists in HTML
- [ ] Fill honeypot field manually (simulate bot)
- [ ] Form should fail silently (no data saved)

---

## Cross-Browser Tests

Test the application in multiple browsers:

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, Mac only)
- [ ] Edge (latest)

### Mobile
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Samsung Internet (Android)

### Features to Test Per Browser
- [ ] Form loads correctly
- [ ] File upload works
- [ ] Form submission works
- [ ] Success/error messages display
- [ ] No console errors

---

## Performance Tests

- [ ] Page loads in under 3 seconds
- [ ] Form submission completes in under 10 seconds
- [ ] No memory leaks (check browser DevTools)
- [ ] Images load properly
- [ ] No broken links

---

## Security Tests

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] No API keys visible in client code
- [ ] Service account credentials not exposed
- [ ] Environment variables not in repository
- [ ] Honeypot field prevents obvious bots
- [ ] File upload size limits enforced
- [ ] CORS headers configured correctly

---

## Accessibility Tests

- [ ] Tab navigation works through form
- [ ] All form fields have labels
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Color contrast meets WCAG standards
- [ ] Works with screen readers (test if possible)

---

## Load Testing (Optional)

If expecting high traffic:
- [ ] Test 10 simultaneous submissions
- [ ] Check Google Sheets handles concurrent writes
- [ ] Check Drive handles concurrent uploads
- [ ] Check SendGrid rate limits
- [ ] Monitor Vercel function performance

---

## Production Readiness

### Final Checks Before Launch
- [ ] All test items above passed
- [ ] Environment variables set in production
- [ ] DNS configured (if using custom domain)
- [ ] Backup plan documented
- [ ] Support contacts updated
- [ ] Monitoring set up (if applicable)
- [ ] Team trained on receiving applications

### Post-Launch Monitoring (First 24 Hours)
- [ ] Monitor Vercel function logs
- [ ] Check for any error emails from Vercel
- [ ] Verify first real submission works
- [ ] Monitor SendGrid delivery rates
- [ ] Check Google Drive storage usage
- [ ] Review Google Sheets data quality

---

## Troubleshooting Reference

If any test fails, check:

1. **Vercel Function Logs**: Vercel Dashboard → Your Project → Functions → Logs
2. **Browser Console**: F12 → Console tab
3. **Network Tab**: F12 → Network tab → Look for failed requests
4. **SendGrid Activity**: SendGrid Dashboard → Activity
5. **Google Cloud Logs**: Google Cloud Console → Logging

Common solutions:
- Clear browser cache
- Redeploy Vercel project
- Verify environment variables
- Check API quotas (Google, SendGrid)
- Review README.md troubleshooting section

---

## Sign-Off

Testing completed by: ___________________________

Date: ___________________________

All critical tests passed: [ ] Yes [ ] No

Notes/Issues:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Ready for production: [ ] Yes [ ] No
