# Microjournal v2

A modern journal application with Twilio/WhatsApp integration for seamless journaling experiences.

## Features

- **User Authentication**: Secure sign up, sign in, and password reset functionality
- **Journal Management**: Create, view, and manage journal entries
- **WhatsApp Integration**: Connect your WhatsApp number to journal by sending messages or voice notes
- **User Settings**: Customize notification preferences and manage phone numbers
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Messaging**: Twilio API
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project
- A Twilio account (for WhatsApp integration)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/SamIrving94/micro-journal.git
cd microjournal-v2
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables by creating a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+your_twilio_number

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

Execute the following SQL in your Supabase SQL editor to set up the necessary tables:

```sql
-- Create journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "whatsapp": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable row level security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);
```

## Testing

Run tests with:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Deployment

This project is configured for deployment on Vercel. Connect your repository to Vercel and set the required environment variables.

For manual deployment, use:

```bash
# For development environment
./scripts/deploy.sh dev

# For staging environment
./scripts/deploy.sh staging

# For production environment
./scripts/deploy.sh prod
```

## Directory Structure

```
microjournal-v2/
├── src/                  # Source code
│   ├── app/              # Next.js app router
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── journal/      # Journal pages
│   │   ├── settings/     # Settings pages
│   │   └── __tests__/    # Page tests
│   ├── lib/              # Shared libraries
│   │   ├── services/     # Service functions
│   │   ├── supabase/     # Supabase client
│   │   ├── twilio/       # Twilio client
│   │   └── types/        # TypeScript types
│   └── types/            # Global types
├── scripts/              # Deployment scripts
├── public/               # Static assets
├── jest.config.js        # Jest configuration
└── jest.setup.js         # Jest setup
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- Original version created by Sam Irving
- Improved and optimized in v2
