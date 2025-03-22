# MicroJournal

A simple, elegant journaling application with WhatsApp integration and voice note transcription.

## Features

- **Email Authentication**: Secure login with email & password
- **Clean UI**: Minimalist interface focused on journaling
- **WhatsApp Integration**: Send journal entries via text or voice notes
- **Voice Transcription**: AI-powered transcription for voice notes
- **Daily Prompts**: Customizable journal prompts

## Setup Instructions

### 1. Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- OpenAI API key (for Whisper voice transcription)
- Twilio account (for WhatsApp integration)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/micro-journal.git
cd micro-journal

# Install dependencies
npm install
```

### 3. Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# WhatsApp Configuration (Meta)
NEXT_PUBLIC_WHATSAPP_API_URL=https://graph.facebook.com/v17.0
NEXT_PUBLIC_WHATSAPP_PHONE_ID=your-whatsapp-phone-id
NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

### 4. Database Setup

1. Run the following SQL migrations in your Supabase SQL editor:
   - `migrations/01_init.sql`
   - `migrations/05_auth_update.sql`
   - `migrations/06_phone_mappings.sql`

2. Enable the following in your Supabase dashboard:
   - Email authentication
   - RLS (Row Level Security) policies

### 5. WhatsApp Integration Setup

1. **Create a Twilio Account**:
   - Sign up for a Twilio account at https://www.twilio.com
   - Activate the WhatsApp Sandbox

2. **Connect WhatsApp Sandbox**:
   - Follow Twilio's instructions to connect your WhatsApp account to the Sandbox
   - Usually involves sending a specific message to +1 415 523 8886

3. **Set Up Webhooks**:
   - In development, use ngrok to expose your local server:
     ```bash
     npx ngrok http 3000
     ```
   - Configure your Twilio WhatsApp Sandbox webhook to point to:
     ```
     https://your-ngrok-url.ngrok-free.app/api/whatsapp/webhook
     ```

### 6. Voice Transcription Setup

1. **Get OpenAI API Key**:
   - Create an account at https://platform.openai.com
   - Generate an API key with access to the Whisper API
   - Add the key to your `.env.local` file

### 7. Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Using Voice Notes

1. Link your WhatsApp number in the app settings
2. Send voice notes to the Twilio WhatsApp number
3. Your voice notes will be automatically transcribed and added to your journal

## Troubleshooting

- **Webhook Issues**: Make sure your ngrok URL is correctly set in Twilio
- **Transcription Errors**: Check your OpenAI API key and usage limits
- **Database Errors**: Verify your Supabase credentials and SQL migrations

## License

MIT
