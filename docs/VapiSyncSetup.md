# Vapi Assistant Synchronization Setup Guide

## Overview

This guide explains how to set up and maintain synchronization between your Vapi AI phone assistants and the Smart Voice AI application. Proper synchronization ensures that your application's database stays updated with changes made in the Vapi dashboard.

## Prerequisites

1. A Vapi account with API access
2. Your Vapi API key
3. Your Smart Voice AI application deployed with a public URL
4. Admin access to your application

## Step 1: Configure Environment Variables

Add these variables to your `.env` file:

```
# Vapi API Configuration
VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_default_assistant_id_here

# Webhook Security
VAPI_WEBHOOK_SECRET=a_secure_random_string
CRON_SECRET_TOKEN=another_secure_random_string
```

## Step 2: Set Up Vapi Webhooks

1. Log in to your Vapi dashboard at [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Go to Settings > Webhooks
3. Add a new webhook with the following details:
   - **URL**: `https://your-domain.com/api/webhooks/vapi`
   - **Events**: Select all assistant and call related events
   - **Secret**: Enter the same value you used for `VAPI_WEBHOOK_SECRET`

## Step 3: Configure Scheduled Sync (Optional but Recommended)

For added reliability, set up scheduled synchronization using a service like Vercel Cron or a separate cron job service:

### Using Vercel Cron

If deploying with Vercel, add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-vapi-assistants?token=YOUR_CRON_SECRET_TOKEN",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Using an External Cron Service

Set up a cron job to call this endpoint every 6 hours:
`curl -X GET "https://your-domain.com/api/cron/sync-vapi-assistants" -H "Authorization: Bearer YOUR_CRON_SECRET_TOKEN"`

## Step 4: Manual Synchronization

As an admin, you can manually trigger synchronization:

1. Log in to your Smart Voice AI application
2. Navigate to the Admin dashboard
3. Go to Assistants Management
4. Click the "Sync with Vapi" button

## Troubleshooting

### Webhook Not Receiving Events

1. Verify your webhook URL is publicly accessible
2. Check that your webhook secret matches the one in your environment variables
3. Ensure your Vapi API key has the necessary permissions

### Missing Assistants After Sync

1. Verify your Vapi account has assistants configured
2. Check application logs for any synchronization errors
3. Ensure your database connection is working properly

### Call Data Not Updating

1. Verify that call webhook events are enabled
2. Check that the assistant IDs match between Vapi and your database
3. Review application logs for any metrics synchronization errors

## Support

For additional help, contact your system administrator or refer to the Smart Voice AI documentation.
