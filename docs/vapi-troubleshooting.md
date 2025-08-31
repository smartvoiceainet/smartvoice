# Vapi Integration Troubleshooting Guide

This guide helps troubleshoot common issues with the Vapi voice assistant integration in Smart Voice AI.

## Configuration Requirements

For the Vapi integration to work properly, you need to configure the following environment variables:

| Variable | Description | Used For |
|----------|-------------|----------|
| `VAPI_API_KEY` | Server-side Vapi API key | Sync operations, webhook handling |
| `NEXT_PUBLIC_VAPI_API_KEY` | Client-side Vapi API key | Frontend voice chat component |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Default assistant ID | Default assistant for voice chat |
| `VAPI_WEBHOOK_SECRET` | Secret for webhook verification | Securing webhook endpoints |
| `MONGODB_URI` | MongoDB connection string | Database connectivity |

## Common Issues and Solutions

### 500 Internal Server Error on Sync

If you receive a 500 error when syncing assistants, check the following:

1. **Verify your VAPI_API_KEY is set correctly**
   - The key must be valid and have sufficient permissions
   - Check for whitespace in the key value
   - Verify the key exists in your `.env.local` file

2. **Check MongoDB connection**
   - Verify the `MONGODB_URI` is correct
   - Ensure MongoDB is running and accessible
   - Check database permissions

3. **Check server logs for specific errors**
   - Look for "Error syncing Vapi assistants" messages
   - Connection timeouts may indicate network issues

### 404 Not Found Error

If you receive a 404 error:

1. **Verify API routes**
   - Ensure the correct route is being called (`/api/voice-ai/assistants/sync`)
   - Check for typos in API URLs

2. **Check Next.js API route files**
   - Verify that `route.ts` files exist in the correct directories
   - Ensure export handlers (POST, GET) are properly defined

### No Assistants Appearing After Sync

If the sync completes but no assistants appear:

1. **Verify Vapi account has assistants**
   - Check your Vapi dashboard to ensure assistants exist
   - Create a test assistant if needed

2. **Check permissions**
   - Ensure your API key has read access to assistants

3. **Inspect network responses**
   - Check the JSON response from the sync API
   - Look for error messages or empty data arrays

## Configuration Validation

Run this endpoint to validate your configuration:

```
GET /api/voice-ai/admin/diagnostics
```

Only available to admin users, this will report the status of all required 
configuration settings and database connectivity.

## Still Having Issues?

If you've gone through the troubleshooting steps and still have issues:

1. Check the detailed server logs for more information
2. Verify your Vapi account status and permissions
3. Try regenerating your API keys
4. Contact support with the specific error messages and configuration details
