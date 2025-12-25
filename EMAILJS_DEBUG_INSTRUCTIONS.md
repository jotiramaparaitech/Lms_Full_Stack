# EmailJS Debugging Instructions

## Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Fill out the inquiry form and submit
4. Check for any error messages

## Step 2: Verify EmailJS Configuration

### Check Your EmailJS Account:
1. Go to https://dashboard.emailjs.com/
2. Verify these settings match your code:
   - **Service ID**: `service_wdj15jn`
   - **Template ID**: `template_xtmll8h`
   - **Public Key**: `gpm7Cf-quPRpX09xI`

### Check EmailJS Template Variables:
Make sure your EmailJS template includes these variables:
- `{{from_name}}`
- `{{from_email}}`
- `{{phone}}`
- `{{subject}}`
- `{{message}}`
- `{{to_email}}`

## Step 3: Common Issues and Solutions

### Issue 1: "Invalid Public Key"
- Solution: Check your Public Key in EmailJS dashboard → Account → API Keys
- Make sure you're using the PUBLIC key, not the PRIVATE key

### Issue 2: "Template not found"
- Solution: Verify the Template ID exists in your EmailJS account
- Check if the template is active

### Issue 3: "Service not found"
- Solution: Verify the Service ID exists
- Check if the service is connected properly (Gmail, Outlook, etc.)

### Issue 4: CORS/Network Errors
- Solution: Check if there are any browser extensions blocking the request
- Try in incognito mode
- Check network tab for failed requests

### Issue 5: Rate Limiting
- Solution: Free EmailJS accounts have limits (200 emails/month)
- Check your usage in the dashboard

## Step 4: Test with Contact Form
Try submitting the Contact form to see if EmailJS works there:
- If Contact form works but Inquiry Modal doesn't → There's a code issue
- If both don't work → EmailJS configuration issue

## Step 5: Alternative Testing
If EmailJS continues to fail, you can:
1. Check the Network tab to see the actual API request
2. Verify the request payload matches what EmailJS expects
3. Test with a different template/service as a fallback

