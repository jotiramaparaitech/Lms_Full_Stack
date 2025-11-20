# Razorpay 503 Error - Troubleshooting Guide

## Understanding the 503 Error

The **503 Service Unavailable** error occurs when the Razorpay client cannot be initialized. This happens when:

- `RAZORPAY_KEY_ID` environment variable is missing or invalid
- `RAZORPAY_KEY_SECRET` environment variable is missing or invalid

## How to Fix

### 1. Check Vercel Environment Variables

Since your server is deployed on Vercel (`lms-full-stack-server-ten-navy.vercel.app`), you need to set the environment variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:
   - `RAZORPAY_KEY_ID` - Your Razorpay Key ID (starts with `rzp_`)
   - `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret

### 2. Important Notes

- **No spaces**: Make sure there are no leading/trailing spaces in the values
- **Case sensitive**: Variable names are case-sensitive
- **Redeploy**: After adding/updating environment variables, you **MUST redeploy** your application for changes to take effect
- **Test vs Live keys**: Make sure you're using the correct keys (test keys for development, live keys for production)

### 3. Verify Configuration

I've added a health check endpoint you can use to verify your Razorpay configuration:

```
GET https://lms-full-stack-server-ten-navy.vercel.app/api/course/purchase/check-config
```

This will return:

- Whether the keys are set
- Whether the client can be initialized
- Any configuration errors

### 4. Check Server Logs

After redeploying, check your Vercel function logs. You should see:

- `✅ Razorpay client initialized successfully` if configured correctly
- `❌ Razorpay Configuration Error:` with details if there's an issue

## Common Issues

### Issue 1: Keys Not Set in Vercel

**Solution**: Add the environment variables in Vercel dashboard and redeploy

### Issue 2: Wrong Key Format

**Solution**:

- Key ID should start with `rzp_test_` (test) or `rzp_live_` (production)
- Key Secret should be a long alphanumeric string
- Copy-paste directly from Razorpay dashboard (no extra spaces)

### Issue 3: Keys Not Synced After Update

**Solution**:

- Redeploy your application in Vercel
- Wait for deployment to complete
- Test again

### Issue 4: Using Test Keys in Production

**Solution**: Make sure you're using the correct environment:

- Test keys (`rzp_test_*`) for development
- Live keys (`rzp_live_*`) for production

## Testing

1. **Check configuration**:

   ```bash
   curl https://lms-full-stack-server-ten-navy.vercel.app/api/course/purchase/check-config
   ```

2. **Test order creation** (after fixing):
   - Try enrolling in a course from your frontend
   - Check browser console for any errors
   - Check Vercel logs for detailed error messages

## Enhanced Error Messages

I've improved the error handling to provide more detailed information:

- Configuration errors now include which variable is missing
- Razorpay API errors show the specific error from Razorpay
- All errors are logged with full details for debugging

## Next Steps

1. ✅ Verify environment variables in Vercel
2. ✅ Redeploy your application
3. ✅ Test the health check endpoint
4. ✅ Try creating an order again
5. ✅ Check logs if issues persist
