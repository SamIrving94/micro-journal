# Deploying Microjournal to Production

This guide will walk you through the process of deploying the Microjournal application to production.

## Prerequisites

- A Supabase account with your database set up
- A domain name (optional, but recommended)
- A Vercel account (recommended for easiest deployment)

## Deployment Steps

### 1. Prepare Your Environment

Create a `.env.production` file with your production environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Run Pre-deployment Checks

```bash
npm run check-deploy
```

This script will verify that all required environment variables are set and that the application builds successfully.

### 3. Deploy to Vercel (Recommended)

#### First-time Setup

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Create a new project on Vercel and connect it to your repository
3. Configure the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy the application

#### Subsequent Deployments

Vercel will automatically deploy new versions when you push changes to your repository.

### 4. Alternative Deployment Options

#### Manual Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm run start`

#### Docker Deployment

A Dockerfile is included for containerized deployments.

1. Build the Docker image:
   ```bash
   docker build -t microjournal .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 -d microjournal
   ```

## Post-Deployment Steps

1. **Test the application thoroughly**
   - Verify that authentication works
   - Check that journal entries can be created and retrieved
   - Ensure that all features work as expected

2. **Set up monitoring** (optional)
   - Consider adding error tracking with Sentry
   - Set up uptime monitoring with UptimeRobot or similar services

3. **Set up analytics** (optional)
   - Configure a privacy-friendly analytics tool like Plausible or Umami

## Troubleshooting

If you encounter issues during deployment:

1. Check that all environment variables are correctly set
2. Verify that your Supabase database is accessible
3. Check the application logs for errors
4. Ensure your database has the correct schema and policies

For more help, refer to the Next.js [deployment documentation](https://nextjs.org/docs/deployment). 