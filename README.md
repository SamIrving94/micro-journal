# Microjournal

Microjournal is a modern journaling application that allows users to create, manage, and review their daily journal entries with a clean, intuitive interface. The application features both web access and messaging integration through SMS and WhatsApp.

## Features

- **Authentication System**: Secure user authentication with Supabase
- **Journal Entries**: Create, view, and manage daily journal entries
- **User Settings**: Configure personal preferences including phone number for notifications
- **WhatsApp Integration**: Send journal entries via WhatsApp
- **SMS Integration**: Send journal entries via SMS
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Messaging**: Twilio API for SMS and WhatsApp integration
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account (for backend services)
- Twilio account (for WhatsApp/SMS integration)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/microjournal.git
cd microjournal
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy the example environment file:

```bash
cp .env.example .env.local
```

4. Set up your environment variables in `.env.local`:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
TWILIO_WHATSAPP_FROM=your-twilio-whatsapp-number
WHATSAPP_VERIFY_TOKEN=your-verify-token

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
microjournal/
├── public/                   # Static assets
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── journal/          # Journal pages
│   │   ├── settings/         # Settings pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── auth/             # Authentication components
│   │   ├── journal/          # Journal components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI components
│   ├── lib/                  # Utilities and libraries
│   │   ├── services/         # Service modules
│   │   ├── supabase/         # Supabase client and utilities
│   │   ├── types/            # TypeScript types
│   │   └── whatsapp/         # WhatsApp integration
│   ├── api/                  # API utilities
│   ├── types/                # Global TypeScript types
│   └── styles/               # Global styles
├── scripts/                  # Utility scripts
│   ├── check-deployment.js   # Deployment validation script
│   ├── deploy.ps1            # Windows deployment script
│   └── deploy.sh             # Unix deployment script
├── supabase/                 # Supabase migrations
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore file
├── next.config.js            # Next.js configuration
├── package.json              # Package dependencies
├── CHANGELOG.md              # Project changes
├── README.md                 # Project documentation (this file)
├── DEPLOYMENT.md             # Deployment guide
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── vercel.json               # Vercel deployment configuration
```

## Database Schema

The application uses the following tables in Supabase:

### Users Table

Contains user information (managed by Supabase Auth).

### Phone Mappings Table

| Column       | Type      | Description                         |
|--------------|-----------|-------------------------------------|
| id           | uuid      | Primary key                         |
| user_id      | uuid      | Foreign key to auth.users table     |
| phone_number | text      | User's phone number                 |
| created_at   | timestamp | When the mapping was created        |
| updated_at   | timestamp | When the mapping was last modified  |

### Journal Entries Table

| Column       | Type      | Description                      |
|--------------|-----------|----------------------------------|
| id           | uuid      | Primary key                      |
| user_id      | uuid      | Foreign key to auth.users table  |
| phone_number | text      | User's phone number (optional)   |
| content      | text      | Journal entry content            |
| source       | text      | Entry source (web, sms, whatsapp)|
| tags         | text[]    | Array of tags for the entry      |
| created_at   | timestamp | When the entry was created       |
| updated_at   | timestamp | When the entry was last modified |

## Key Features Explained

### Authentication

The application uses Supabase Authentication for secure user sign-up, sign-in, and account management.

### Journal Entries

Users can create daily journal entries, view past entries, and search/filter through their journal history.

### WhatsApp Integration

Users can send journal entries via WhatsApp, which will be automatically added to their account.

### SMS Integration

Users can send journal entries via SMS, which will be automatically added to their account.

### User Settings

Users can configure various preferences, including their phone number for messaging integration.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for their amazing framework
- Supabase for their excellent backend service
- Twilio for their messaging APIs

