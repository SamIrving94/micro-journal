# Microjournal v2

A simple, beautiful way to journal your thoughts and connect your journaling experience with messaging apps like WhatsApp.

## Features

- **User Authentication**: Secure authentication using Supabase with email/password
- **Journal Entries**: Create, view, edit, and delete journal entries
- **WhatsApp Integration**: Send journal entries from WhatsApp
- **User Settings**: Customize notification preferences

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Messaging**: Twilio API for WhatsApp integration
- **Styling**: Tailwind CSS with Forms plugin

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- (Optional) A Twilio account for WhatsApp integration

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/microjournal-v2.git
   cd microjournal-v2
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create an `.env.local` file based on `.env.example`
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`:
   - Supabase URL and anon key
   - Twilio credentials (if using WhatsApp integration)

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following Supabase tables:

- **users**: User authentication and profile data
- **journal_entries**: Stores all journal entries
- **user_settings**: User preferences and notification settings

## Key Improvements in v2

- Enhanced error handling with better type safety
- Improved UI/UX with responsive design
- Better state management
- More robust authentication flow
- Improved WhatsApp integration

## Deployment

The application can be deployed to Vercel or any other Next.js compatible hosting:

```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
