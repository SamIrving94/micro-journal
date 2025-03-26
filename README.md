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

This application is production-ready and can be deployed to various platforms.

### Quick Deployment Steps

1. Set up your environment variables in `.env.production`
2. Run the pre-deployment check: `npm run check-deploy`
3. Deploy to Vercel, Netlify, or any other platform supporting Next.js

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

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
