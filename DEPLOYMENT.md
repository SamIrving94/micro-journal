# Deployment Guide for MicroJournal

This document provides a step-by-step guide for deploying the MicroJournal application to a production environment.

## Deployment Options

MicroJournal can be deployed using various platforms. Below are the recommended options:

### 1. Vercel (Recommended)

[Vercel](https://vercel.com) is the best platform for deploying Next.js applications, as it's made by the same team behind Next.js.

#### Steps:

1. **Create a Vercel Account**: 
   - Sign up at [vercel.com](https://vercel.com) if you don't have an account.

2. **Install Vercel CLI** (optional for command line deployment):
   ```
   npm install -g vercel
   ```

3. **Connect Your GitHub Repository**:
   - Go to the Vercel dashboard and click "Import Project"
   - Choose "Import Git Repository"
   - Select your MicroJournal repository
   - Authorize Vercel to access your GitHub account if prompted

4. **Configure Project Settings**:
   - Set the Build Command: `npm run build`
   - Set the Output Directory: `.next`
   - Add Environment Variables in the Vercel dashboard:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL for production
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key for production

5. **Deploy**:
   - Click "Deploy" and wait for the build to complete
   - Vercel will provide you with a URL where your application is deployed

### 2. Netlify

[Netlify](https://netlify.com) is another excellent platform for hosting Next.js applications.

#### Steps:

1. **Create a Netlify Account**:
   - Sign up at [netlify.com](https://netlify.com) if you don't have an account.

2. **Connect Your GitHub Repository**:
   - Click "New site from Git"
   - Choose GitHub as your Git provider
   - Select your MicroJournal repository

3. **Configure Build Settings**:
   - Set the Build Command: `npm run build`
   - Set the Publish Directory: `.next`

4. **Add Environment Variables**:
   - In the Netlify dashboard, go to Site Settings > Environment Variables
   - Add the same environment variables as listed for Vercel

5. **Deploy**:
   - Click "Deploy site"

## Database Setup for Production

### Supabase Production Project

1. **Create a Production Project in Supabase**:
   - Log in to your Supabase account
   - Create a new project specifically for production

2. **Run Migrations**:
   - Execute the SQL migrations from the `migrations/` folder in your production Supabase project

3. **Configure Authentication**:
   - In the Supabase dashboard, go to Authentication > Settings:
     - Enable Email Authentication
     - Configure the Site URL to match your deployed application URL
     - Set up any additional security settings as needed

4. **Update Environment Variables**:
   - Update your production environment variables with the production Supabase credentials

## Post-Deployment Checklist

After deploying, go through this checklist to ensure everything is working correctly:

1. **Test Authentication**:
   - Sign up with a new account
   - Sign in with an existing account
   - Test password reset functionality

2. **Test Journal Features**:
   - Create new journal entries
   - View existing entries
   - Delete entries
   - Navigate through the calendar

3. **Check Mobile Responsiveness**:
   - Test the application on various device sizes

4. **Performance Monitoring**:
   - Set up monitoring tools like Vercel Analytics or Google Analytics
   - Monitor for any errors in the application logs

## Troubleshooting Common Issues

### Authentication Issues

- **Problem**: Users can't sign in or sign up
- **Solution**: Check your Supabase Auth configuration and ensure the Site URL is correctly set to your deployed URL

### Database Connection Issues

- **Problem**: Can't connect to the database
- **Solution**: Verify your Supabase URL and anon key in your environment variables

### Build Errors

- **Problem**: Build fails during deployment
- **Solution**: Check the build logs for specific errors. Common issues include:
  - Missing dependencies
  - TypeScript errors
  - Environment variable issues

## Updating Your Deployed Application

To update your deployed application:

1. **Make and test changes locally**
2. **Commit changes to your GitHub repository**
3. **If using Vercel or Netlify with auto-deployment**:
   - The changes will be automatically deployed
4. **If using manual deployment**:
   - Run the deployment command again:
     ```
     vercel --prod
     ```
     or for Netlify:
     ```
     netlify deploy --prod
     ```

## Scaling Considerations

As your user base grows, consider the following:

- **Supabase Plan**: Upgrade your Supabase plan based on usage
- **Performance Optimization**: Implement caching strategies for frequently accessed data
- **Monitoring**: Set up alerts for errors and performance issues 