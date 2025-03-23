# MicroJournal

MicroJournal is a minimalist journaling application that allows users to write, view, and manage their journal entries through a clean and intuitive interface. The application supports email authentication and provides a seamless journaling experience.

## Features

- **Email Authentication**: Secure sign-up and sign-in using Supabase's authentication system with email OTP
- **Password Recovery**: Password reset functionality for users who forgot their credentials
- **Journal Entry Management**: Create, read, and delete journal entries
- **Calendar View**: Browse journal entries by date using the integrated calendar
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase for authentication and data storage
- **Database**: PostgreSQL (provided by Supabase)
- **Authentication**: Supabase Auth with email magic links

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/SamIrving94/micro-journal.git
   cd micro-journal
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the project root with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   Run the SQL migrations in the `migrations/` folder in your Supabase project.

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application can be deployed using Vercel, Netlify, or any other platform that supports Next.js applications.

### Deploy on Vercel (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Visit [Vercel](https://vercel.com) and sign up or log in.
3. Click "New Project" and import your repository.
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `./` (or your project root)
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add the environment variables under "Environment Variables" section:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Any other required variables
6. Click "Deploy" and wait for the build to complete.

### Deploy on Netlify

1. Push your code to a Git repository.
2. Visit [Netlify](https://netlify.com) and sign up or log in.
3. Click "New site from Git" and select your repository.
4. Configure the build settings:
   - Build Command: `npm run build`
   - Publish Directory: `.next`
5. Add the environment variables under "Site settings" → "Environment variables":
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Any other required variables
6. Click "Deploy site" and wait for the build to complete.

### Important Deployment Notes

1. Ensure your Supabase project has the correct authentication settings:
   - Enable Email Auth in the Supabase Dashboard
   - Configure the Site URL in Supabase Auth settings to match your deployed URL
   - Set up any necessary redirect URLs for authentication

2. Update CORS settings in Supabase if needed, to allow requests from your deployed domain.

## Project Structure

- `/src` - Source code
  - `/app` - Next.js app directory
    - `/api` - API routes
    - `/auth` - Authentication pages
    - `/components` - React components
    - `/journal` - Journal pages
    - `/settings` - Settings pages
  - `/lib` - Utility functions and services
  - `/types` - TypeScript type definitions
- `/migrations` - Database migrations
- `/public` - Static assets

## Testing

The project uses Jest and React Testing Library for testing. To run tests:

```
npm test
```

To run tests with coverage:

```
npm run test:coverage
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
