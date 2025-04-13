# MicroJournal Integration Settings

## Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# OpenAI
OPENAI_API_KEY=your_openai_key
```

## Integration Details

### Supabase Configuration
- **Project URL**: [Your Supabase Project URL]
- **Database Schema**: 
  ```sql
  -- Users table (handled by Supabase Auth)
  -- Journal entries
  create table journal_entries (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- WhatsApp messages
  create table whatsapp_messages (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    message_sid text not null,
    content text not null,
    is_voice boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```
- **Authentication Settings**:
  - Email/Password enabled
  - Magic Links enabled
  - Password reset enabled

### Twilio Configuration
- **WhatsApp Sandbox Settings**:
  - Phone Number: [Your Twilio WhatsApp Number]
  - Webhook URL: [Your Webhook URL]
  - Webhook Method: POST
  - Verify Token: [Your Verify Token]

### OpenAI Configuration
- **API Version**: Latest
- **Model**: Whisper for voice transcription
- **Usage Limits**: [Your Current Limits]

### Vercel Configuration
- **Project Name**: micro-journal
- **Framework Preset**: Next.js
- **Build Command**: npm run build
- **Output Directory**: .next
- **Environment Variables**: All variables from .env.local

## Migration Steps

### 1. Supabase Migration
1. Create new Supabase project
2. Run database migrations
3. Configure authentication settings
4. Update environment variables

### 2. Twilio Migration
1. Update webhook URL in Twilio console
2. Verify webhook configuration
3. Test message delivery

### 3. OpenAI Migration
1. Verify API key
2. Test transcription service
3. Update rate limits if needed

### 4. Vercel Migration
1. Create new project
2. Configure environment variables
3. Set up deployment settings
4. Configure custom domain (if applicable)

## Security Notes
- Keep all API keys and tokens secure
- Use environment variables for all sensitive data
- Regularly rotate credentials
- Monitor API usage and limits

## Testing Checklist
- [ ] Supabase connection
- [ ] Twilio webhook
- [ ] OpenAI transcription
- [ ] Vercel deployment
- [ ] Authentication flow
- [ ] Database operations
- [ ] WhatsApp message handling 