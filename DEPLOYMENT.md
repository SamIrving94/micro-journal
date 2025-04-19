# Deploying Microjournal v2

This guide walks through the steps to deploy Microjournal v2 to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your code pushed to a GitHub, GitLab, or Bitbucket repository
3. A [Supabase account](https://supabase.com) with your project set up
4. A [Twilio account](https://www.twilio.com) (for WhatsApp integration)

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Vercel account
2. Click on "Add New..." > "Project"
3. Select the repository containing your Microjournal v2 code
4. Click "Import"

### 2. Configure Project Settings

1. **Project Name**: Enter a name for your project (e.g., "microjournal-v2")
2. **Framework Preset**: Vercel should automatically detect Next.js
3. **Root Directory**: If your code is not in the root of the repository, specify the directory (e.g., "microjournal-v2")
4. **Build Command**: Keep the default (`npm run build`) or customize if needed
5. **Output Directory**: Keep the default (.next) for Next.js projects

### 3. Set Up Environment Variables

Add the following environment variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+your_twilio_number

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
```

For production, update `NEXT_PUBLIC_APP_URL` to your custom domain if you have one.

### 4. Deploy

Click "Deploy" and wait for the build and deployment to complete.

## Setting Up Custom Domain (Optional)

1. Go to your project dashboard
2. Click on "Settings" > "Domains"
3. Enter your domain name
4. Follow Vercel's instructions to configure your DNS settings

## Configuring Twilio Webhook (for WhatsApp Integration)

For WhatsApp integration to work, you need to configure a webhook in Twilio:

1. Log in to your Twilio account
2. Go to "Programmable Messaging" > "Settings" > "WhatsApp Sandbox Settings"
3. In the "When a message comes in" field, enter:
   ```
   https://your-vercel-app-url.vercel.app/api/webhook
   ```
4. Set the HTTP method to "HTTP POST"
5. Click "Save"

## Configuring Supabase Authentication Redirect URLs

1. Log in to your Supabase dashboard
2. Go to "Authentication" > "URL Configuration"
3. Add your Vercel deployment URL to "Site URL" and "Redirect URLs":
   ```
   https://your-vercel-app-url.vercel.app
   https://your-vercel-app-url.vercel.app/auth/callback
   ```
4. Click "Save"

## Verifying Deployment

1. Visit your deployed app at the Vercel URL or custom domain
2. Verify that authentication works (sign up, sign in)
3. Test creating and viewing journal entries
4. Test WhatsApp integration by sending a message to your Twilio WhatsApp number

## Setting Up Continuous Deployment

By default, Vercel will automatically deploy new changes when you push to your repository. You can configure this behavior:

1. Go to your project dashboard
2. Click on "Settings" > "Git"
3. Configure production branch and deploy settings as needed

## Troubleshooting

If you encounter issues with your deployment:

1. Check Vercel deployment logs for errors
2. Verify that all environment variables are set correctly
3. Ensure your Supabase database is properly set up with the correct tables and policies
4. Check that your Twilio webhook is configured correctly

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp/api) 