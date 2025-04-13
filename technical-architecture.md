# Technical Architecture Documentation

## System Overview

### Architecture Principles
- Microservices-based architecture
- Event-driven messaging system
- Security-first design
- Scalable infrastructure
- Observable systems

## Component Architecture

### Frontend Layer (Next.js)
1. **Client Application**
1. **Client Application**
   - Next.js 14+ with App Router
   - TypeScript for type safety
   - Path aliases configuration:
     ```typescript
     {
       "@/*": ["./src/*"],
       "@/components/*": ["src/components/*"],
       "@/lib/*": ["src/lib/*"],
       "@/styles/*": ["src/styles/*"],
       "@/types/*": ["src/types/*"]
     }
     ```
   - Component structure:
     ```
     src/
     ├── app/                 # App router pages
     ├── components/          # Reusable components
     │   ├── ui/             # Basic UI components
     │   ├── forms/          # Form components
     │   └── layouts/        # Layout components
     ├── lib/                # Utility functions
     ├── hooks/              # Custom React hooks
     ├── types/              # TypeScript definitions
     └── styles/ 

2. **State Management**
   - React Context for global state
   - React Query for server state
   - Local storage for preferences
   - Service workers for offline capability

3. **API Integration**
   - REST endpoints for CRUD operations
   - WebSocket connections for real-time updates
   - Rate limiting and retry logic
   - Error boundary implementation

### Backend Services

1. **API Layer**
   ```
   /api
   ├── auth/           # Authentication endpoints
   ├── journal/        # Journal CRUD operations
   ├── preferences/    # User preferences
   ├── analytics/      # Analytics and insights
   └── webhooks/       # External service webhooks
   ```

2. **Supabase Integration**
   - Authentication service
   - Real-time subscriptions
   - Database operations
   - Storage service
   - Edge functions

3. **Message Processing Service**
   - WhatsApp message handling
   - Template management
   - Delivery tracking
   - Retry mechanism

### Database Schema (PostgreSQL)

1. **Users Table**
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     phone_number TEXT UNIQUE NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW(),
     preferences JSONB DEFAULT '{}',
     subscription_status TEXT DEFAULT 'free',
     is_verified BOOLEAN DEFAULT false
   );
   ```

2. **Journal Entries Table**
   ```sql
   CREATE TABLE journal_entries (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     content TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     prompt_id UUID REFERENCES prompts(id),
     metadata JSONB DEFAULT '{}',
     is_deleted BOOLEAN DEFAULT false,
     CONSTRAINT content_length CHECK (char_length(content) <= 1000)
   );
   ```

3. **Prompts Table**
   ```sql
   CREATE TABLE prompts (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     content TEXT NOT NULL,
     category TEXT,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **User Preferences Table**
   ```sql
   CREATE TABLE user_preferences (
     user_id UUID REFERENCES users(id),
     prompt_time TIME NOT NULL,
     timezone TEXT NOT NULL,
     prompt_categories TEXT[],
     notification_preferences JSONB,
     PRIMARY KEY (user_id)
   );
   ```

### Security Implementation

1. **Authentication Flow**
   - Email/password authentication
   - Phone number verification
   - Multi-factor authentication
   - JWT token management
   - Session handling

2. **Authorization**
   ```sql
   -- Row Level Security Policies
   ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can only access their own entries"
   ON journal_entries
   FOR ALL
   USING (auth.uid() = user_id);
   ```

3. **Data Protection**
   - End-to-end encryption for journal entries
   - At-rest encryption
   - Secure key management
   - Regular security audits

### External Integrations

1. **WhatsApp Business API**
   ```typescript
   interface WhatsAppConfig {
     apiVersion: string;
     phoneNumberId: string;
     accessToken: string;
     webhookSecret: string;
     messageTemplates: {
       daily_prompt: string;
       verification: string;
       reminder: string;
     };
   }
   ```

2. **Analytics Integration**
   - Event tracking
   - User behavior analysis
   - Performance monitoring
   - Error tracking

### Deployment Architecture

1. **Infrastructure (Vercel)**
   - Edge network deployment
   - Automatic scaling
   - Zero-downtime deployments
   - Built-in monitoring

2. **Environment Configuration**
   ```
   .env.local
   ├── NEXT_PUBLIC_SUPABASE_URL
   ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
   ├── WHATSAPP_API_KEY
   ├── WHATSAPP_PHONE_NUMBER_ID
   └── ENCRYPTION_KEY
   ```

3. **Monitoring Setup**
   - Application performance monitoring
   - Error tracking
   - User analytics
   - Server metrics

### Development Workflow

1. **Version Control**
   ```
   .
   ├── main           # Production branch
   ├── staging        # Staging environment
   ├── development    # Development branch
   └── feature/*      # Feature branches
   ```

2. **CI/CD Pipeline**
   - Automated testing
   - Code quality checks
   - Security scanning
   - Automated deployments

### API Endpoints

1. **Authentication**
   ```
   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/verify-phone
   POST /api/auth/refresh-token
   ```

2. **Journal Operations**
   ```
   GET /api/journal/entries
   POST /api/journal/entries
   GET /api/journal/entries/:id
   PUT /api/journal/entries/:id
   DELETE /api/journal/entries/:id
   ```

3. **User Preferences**
   ```
   GET /api/preferences
   PUT /api/preferences
   PATCH /api/preferences/notifications
   ```

### Error Handling

1. **Error Codes**
   ```typescript
   enum ErrorCodes {
     INVALID_INPUT = 'INVALID_INPUT',
     UNAUTHORIZED = 'UNAUTHORIZED',
     RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
     MESSAGE_DELIVERY_FAILED = 'MESSAGE_DELIVERY_FAILED',
     DATABASE_ERROR = 'DATABASE_ERROR'
   }
   ```

2. **Error Response Format**
   ```typescript
   interface ErrorResponse {
     code: ErrorCodes;
     message: string;
     details?: Record<string, any>;
     requestId?: string;
   }
   ```

## Performance Considerations

### Optimization Strategies
1. **Database**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Caching layer

2. **API Performance**
   - Response compression
   - Rate limiting
   - Cache headers
   - Edge functions

3. **Frontend Performance**
   - Code splitting
   - Image optimization
   - Progressive loading
   - Service worker caching

## Scaling Strategy

### Horizontal Scaling
- Stateless services
- Load balancing
- Database replication
- Cache distribution

### Vertical Scaling
- Resource optimization
- Memory management
- Connection pooling
- Query optimization