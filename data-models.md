# Data Models and Schema Documentation

## Database Overview

Our database schema is designed for simplicity and performance, leveraging Supabase's built-in features. We focus on essential tables with minimal relationships.

### Core Design Principles
- Minimal table relationships
- Built-in Supabase authentication
- Optimized for real-time updates
- Simple, flat data structures where possible

We use PostgreSQL with Supabase for our primary database. The schema is designed to support:
- User authentication and profiles
- Journal entries and metadata
- User preferences and settings
- Analytics and aggregations
- Message delivery tracking

## Core Tables

### Users Table
```sql
CREATE TABLE users (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    metadata JSONB DEFAULT '{}'::jsonb,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise'))
);

-- Indices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_status ON users(status);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);
```

### Journal Entries Table
```sql
CREATE TABLE journal_entries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    prompt_id UUID REFERENCES prompts(id),
    source TEXT DEFAULT 'web' CHECK (source IN ('web', 'whatsapp', 'api')),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_deleted BOOLEAN DEFAULT FALSE,
    word_count INTEGER GENERATED ALWAYS AS (array_length(regexp_split_to_array(content, '\s+'), 1)) STORED,
    
    -- Enforce character limit
    CONSTRAINT content_length CHECK (char_length(content) <= 1000),
    
    -- Ensure created_at is not in the future
    CONSTRAINT valid_creation_date CHECK (created_at <= NOW())
);

-- Indices
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_journal_entries_prompt_id ON journal_entries(prompt_id);
CREATE INDEX idx_journal_entries_source ON journal_entries(source);

-- Full Text Search
CREATE INDEX idx_journal_entries_content_search ON journal_entries 
    USING gin(to_tsvector('english', content));

-- Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
    ON journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
    ON journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
    ON journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
    ON journal_entries FOR DELETE
    USING (auth.uid() = user_id);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    prompt_time TIME NOT NULL DEFAULT '20:00',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    prompt_categories TEXT[] DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{
        "platform": "whatsapp",
        "reminders": true,
        "weekly_digest": true,
        "monthly_summary": true
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_timezone CHECK (timezone IN (SELECT name FROM pg_timezone_names))
);

-- Indices
CREATE INDEX idx_user_preferences_prompt_time ON user_preferences(prompt_time);
CREATE INDEX idx_user_preferences_timezone ON user_preferences(timezone);

-- Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);
```

### Prompts Table
```sql
CREATE TABLE prompts (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT content_length CHECK (char_length(content) <= 500)
);

-- Indices
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_frequency ON prompts(frequency);
CREATE INDEX idx_prompts_is_active ON prompts(is_active);

-- Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active prompts"
    ON prompts FOR SELECT
    USING (is_active = TRUE);
```

### Message Delivery Table
```sql
CREATE TABLE message_deliveries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('prompt', 'reminder', 'digest', 'verification')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    platform TEXT NOT NULL DEFAULT 'whatsapp' CHECK (platform IN ('whatsapp', 'email', 'sms')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    delivery_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure scheduled_for is not in the past on creation
    CONSTRAINT valid_schedule_time CHECK (scheduled_for >= created_at)
);

-- Indices
CREATE INDEX idx_message_deliveries_user_id ON message_deliveries(user_id);
CREATE INDEX idx_message_deliveries_status ON message_deliveries(status);
CREATE INDEX idx_message_deliveries_scheduled_for ON message_deliveries(scheduled_for);

-- Row Level Security
ALTER TABLE message_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own message deliveries"
    ON message_deliveries FOR SELECT
    USING (auth.uid() = user_id);
```

## Views

### User Stats View
```sql
CREATE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(DISTINCT je.id) as total_entries,
    MAX(je.created_at) as last_entry_date,
    AVG(je.word_count) as avg_word_count,
    COUNT(DISTINCT DATE(je.created_at)) as total_days_journaled
FROM users u
LEFT JOIN journal_entries je ON u.id = je.user_id
WHERE NOT je.is_deleted
GROUP BY u.id, u.email;
```

### Active Streaks View
```sql
CREATE VIEW active_streaks AS
WITH consecutive_days AS (
    SELECT 
        user_id,
        created_at::date as entry_date,
        created_at::date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at::date))::integer AS grp
    FROM (
        SELECT DISTINCT user_id, created_at::date
        FROM journal_entries
        WHERE NOT is_deleted
    ) sub
)
SELECT 
    user_id,
    COUNT(*) as streak_length,
    MIN(entry_date) as streak_start,
    MAX(entry_date) as streak_end
FROM consecutive_days
GROUP BY user_id, grp
HAVING MAX(entry_date) = CURRENT_DATE;
```

## Functions

### Calculate User Streak
```sql
CREATE OR REPLACE FUNCTION get_user_streak(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER;
BEGIN
    WITH consecutive_days AS (
        SELECT 
            created_at::date as entry_date,
            created_at::date - (ROW_NUMBER() OVER (ORDER BY created_at::date))::integer AS grp
        FROM (
            SELECT DISTINCT created_at::date
            FROM journal_entries
            WHERE journal_entries.user_id = get_user_streak.user_id
            AND NOT is_deleted
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        ) sub
    )
    SELECT COUNT(*)
    INTO streak
    FROM consecutive_days
    GROUP BY grp
    HAVING MAX(entry_date) = CURRENT_DATE
    ORDER BY MAX(entry_date) DESC
    LIMIT 1;
    
    RETURN COALESCE(streak, 0);
END;
$$ LANGUAGE plpgsql;
```

### Update Entry Statistics
```sql
CREATE OR REPLACE FUNCTION update_entry_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update user statistics for new entry
        INSERT INTO user_statistics (
            user_id,
            total_entries,
            last_entry_date,
            avg_word_count
        )
        VALUES (
            NEW.user_id,
            1,
            NEW.created_at,
            NEW.word_count
        )
        ON CONFLICT (user_id) DO UPDATE
        SET 
            total_entries = user_statistics.total_entries + 1,
            last_entry_date = GREATEST(user_statistics.last_entry_date, NEW.created_at),
            avg_word_count = (user_statistics.avg_word_count * user_statistics.total_entries + NEW.word_count) / (user_statistics.total_entries + 1);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entry_statistics_update
AFTER INSERT ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_entry_statistics();
```

## Backup and Recovery

### Backup Schedule
- Full database backup: Daily at 00:00 UTC
- Write-ahead log (WAL) archiving: Continuous
- Retention period: 30 days

### Recovery Procedures
1. Point-in-time recovery available using WAL archives
2. Automated backup verification
3. Regular recovery testing

## Data Retention

### Retention Rules
1. Journal Entries
   - Kept indefinitely while account is active
   - Marked as deleted but not physically removed
   - Physical deletion after 30 days of account closure

2. Message Deliveries
   - Kept for 90 days
   - Aggregated statistics retained indefinitely

3. User Data
   - Kept while account is active
   - Anonymized 30 days after account closure
   - Full deletion after 90 days of account closure

## Data Migration

### Version Control
- All schema changes are version controlled
- Migration files are stored in `/migrations` directory
- Both up and down migrations are provided

### Sample Migration
```sql
-- Migration: 2024_01_14_add_word_count_to_entries
-- Up
ALTER TABLE journal_entries
ADD COLUMN word_count INTEGER GENERATED ALWAYS AS (
    array_length(regexp_split_to_array(content, '\s+'), 1)
) STORED;

CREATE INDEX idx_journal_entries_word_count 
ON journal_entries(word_count);

-- Down
DROP INDEX idx_journal_entries_word_count;
ALTER TABLE journal_entries DROP COLUMN word_count;
```

## Performance Considerations

### Indexing Strategy
1. Primary indices on frequently queried columns
2. Composite indices for common query patterns
3. Full-text search indices for content searching
4. Regular index maintenance and optimization

### Partitioning Strategy
1. Journal Entries
   - Partitioned by month
   - Retention policy automated
   - Archival strategy for old data

2. Message Deliveries
   - Partitioned by status and date
   - Automatic cleanup of old records

## Security Measures

### Data Encryption
1. Passwords
   - Argon2 hashing
   - Salt per password
   - Regular security audits

2. Sensitive Data
   - Encrypted at rest
   - TLS in transit
   - Key rotation policy

### Access Control
1. Row Level Security
   - User-specific policies
   - Role-based access
   - Audit logging

2. API Access
   - Token-based authentication
   - Rate limiting
   - Request logging
