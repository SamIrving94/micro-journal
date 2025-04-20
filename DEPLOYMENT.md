# Microjournal v2 Deployment Guide

This document provides step-by-step instructions for deploying the Microjournal v2 application to Vercel.

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

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
TWILIO_WHATSAPP_FROM=your-twilio-whatsapp-number
```

### Vercel Configuration

The project includes a `vercel.json` file with the following configuration:

```json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## Deployment Methods

### Method 1: Using Deployment Scripts

We've provided deployment scripts for both Windows and Unix-based systems.

#### Windows (PowerShell):

```powershell
# Navigate to the project directory
cd microjournal-v2

# Run the deployment script
.\scripts\deploy.ps1
```

#### Unix-based systems (Linux/macOS):

```bash
# Navigate to the project directory
cd microjournal-v2

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
cd microjournal-v2
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
6. Add your environment variables
7. Click "Deploy"

## Checking Deployment Status

After deployment, you can check the status of your application by:

1. Visiting the Vercel dashboard
2. Checking the provided deployment URL
3. Monitoring the application logs

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

## Maintenance

Regular maintenance tasks include:

1. Updating dependencies with `npm update`
2. Monitoring Vercel and Supabase usage
3. Checking application logs for errors
4. Updating environment variables as needed

## Support

If you encounter any issues not covered in this guide, please contact the development team. 