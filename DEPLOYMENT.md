# Microjournal Deployment Guide

This document provides step-by-step instructions for deploying the Microjournal application to Vercel.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm or yarn
- Git
- Vercel CLI (optional for command-line deployments)

## Configuration

### Environment Variables

The application requires several environment variables to function properly. Create a `.env.local` file in the root of the project with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Alternative names for Vercel Supabase Integration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
TWILIO_WHATSAPP_FROM=your-twilio-whatsapp-number
WHATSAPP_VERIFY_TOKEN=your-verify-token

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=your-app-url

# Next Auth Configuration
NEXTAUTH_URL=your-nextauth-url
NEXTAUTH_SECRET=your-nextauth-secret
```

### Vercel Configuration

The project includes a `vercel.json` file with the following configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "TWILIO_ACCOUNT_SID": "@twilio_account_sid",
    "TWILIO_AUTH_TOKEN": "@twilio_auth_token",
    "TWILIO_PHONE_NUMBER": "@twilio_phone_number",
    "TWILIO_WHATSAPP_FROM": "@twilio_whatsapp_from",
    "WHATSAPP_VERIFY_TOKEN": "@whatsapp_verify_token",
    "OPENAI_API_KEY": "@openai_api_key",
    "NEXT_PUBLIC_APP_URL": "https://microjournal.vercel.app",
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  },
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## Pre-Deployment Validation

Before deploying, run the deployment validation script to ensure all requirements are met:

```bash
# Navigate to the project directory
cd microjournal

# Run the validation script
node scripts/check-deployment.js
```

The script checks for:
- Required files existence
- Correct configuration in package.json
- Environment variables
- Vercel configuration

Fix any errors or warnings reported by the validation script before proceeding.

## Deployment Methods

### Method 1: Using Deployment Scripts

We've provided deployment scripts for both Windows and Unix-based systems.

#### Windows (PowerShell):

```powershell
# Navigate to the project directory
cd microjournal

# Run the deployment script
.\scripts\deploy.ps1
```

#### Unix-based systems (Linux/macOS):

```bash
# Navigate to the project directory
cd microjournal

# Make the script executable if needed
chmod +x ./scripts/deploy.sh

# Run the deployment script
./scripts/deploy.sh
```

### Method 2: Manual Deployment with Vercel CLI

1. Install Vercel CLI globally:

```bash
npm install -g vercel
```

2. Navigate to the project directory:

```bash
cd microjournal
```

3. Run the deployment validation:

```bash
node scripts/check-deployment.js
```

4. Deploy to Vercel:

```bash
# For preview deployment
vercel

# For production deployment
vercel --prod
```

### Method 3: Deploying via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Login to the [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your Git repository
5. Configure the project:
   - Framework preset: Next.js
   - Build Command: `next build`
   - Install Command: `npm install`
   - Output Directory: `.next`
6. Add your environment variables from the list above
7. Click "Deploy"

## Setting Up Webhooks

### WhatsApp Webhook

1. In your Twilio console, navigate to the WhatsApp settings
2. Set the webhook URL to:
   ```
   https://your-deployed-url.com/api/whatsapp/webhook
   ```
3. Set the webhook method to `POST`
4. Configure the verify token to match your `WHATSAPP_VERIFY_TOKEN` environment variable

### SMS Webhook

1. In your Twilio console, navigate to the Phone Numbers settings
2. Set the SMS webhook URL to:
   ```
   https://your-deployed-url.com/api/twilio
   ```
3. Set the webhook method to `POST`

## Checking Deployment Status

After deployment, you can check the status of your application by:

1. Visiting the Vercel dashboard
2. Checking the provided deployment URL
3. Monitoring the application logs
4. Testing the authentication and journaling features
5. Verifying SMS and WhatsApp integrations

## Troubleshooting

### Environment Variables

If you encounter issues with environment variables:

1. Check that all required variables are set in your Vercel project settings
2. Ensure the variable names match those used in the code
3. For local development, verify your `.env.local` file

### Build Errors

If the build fails:

1. Run `npm run build` locally to identify the issue
2. Check for linting errors with `npm run lint`
3. Ensure all dependencies are correctly installed

### Webhook Configuration

If Twilio webhooks are not working:

1. Verify the webhook URLs are correctly set in your Twilio dashboard
2. Ensure the webhook endpoints in the application are accessible
3. Check the Twilio account balance and permissions
4. Verify that your `WHATSAPP_VERIFY_TOKEN` matches what's configured in Twilio

## Maintenance

Regular maintenance tasks include:

1. Updating dependencies with `npm update`
2. Monitoring Vercel and Supabase usage
3. Checking application logs for errors
4. Updating environment variables as needed
5. Running database migrations

## Support

If you encounter any issues not covered in this guide, please refer to:
- The [CHANGELOG.md](./CHANGELOG.md) for recent updates
- Supabase and Twilio documentation for service-specific issues
- Next.js documentation for framework-related questions 