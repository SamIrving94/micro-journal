# MicroJournal API Documentation

## API Overview

Our API follows a simplified, RESTful architecture focusing on core journaling functionality. We use Supabase for authentication and database operations.

### Key Design Principles
- Minimal endpoint complexity
- Direct database operations through Supabase
- Real-time capabilities where needed
- Simple authentication flow

Base URL: `https://api.microjournal.app/v1`

### Authentication
All API requests must include an authentication token in the Authorization header:
```
Authorization: Bearer {token}
```

## Authentication Endpoints

### Register New User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "usr_123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-14T12:00:00Z"
  },
  "token": "eyJhbGciOiJ..."
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJ...",
  "user": {
    "id": "usr_123abc",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Verify Phone Number
```http
POST /auth/verify-phone
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "verified": true,
  "message": "Phone number verified successfully"
}
```

## Journal Entries

### Create Journal Entry
```http
POST /entries
```

**Request Body:**
```json
{
  "content": "Today was a great day...",
  "metadata": {
    "prompt": "What made you smile today?",
    "source": "whatsapp"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "ent_xyz789",
  "content": "Today was a great day...",
  "createdAt": "2024-01-14T15:30:00Z",
  "metadata": {
    "prompt": "What made you smile today?",
    "source": "whatsapp"
  }
}
```

### Get Entries
```http
GET /entries
```

**Query Parameters:**
- `from` (optional): ISO date string
- `to` (optional): ISO date string
- `limit` (optional): number (default: 20)
- `offset` (optional): number (default: 0)

**Response:** `200 OK`
```json
{
  "entries": [
    {
      "id": "ent_xyz789",
      "content": "Today was a great day...",
      "createdAt": "2024-01-14T15:30:00Z",
      "metadata": {
        "prompt": "What made you smile today?",
        "source": "whatsapp"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Single Entry
```http
GET /entries/:id
```

**Response:** `200 OK`
```json
{
  "id": "ent_xyz789",
  "content": "Today was a great day...",
  "createdAt": "2024-01-14T15:30:00Z",
  "metadata": {
    "prompt": "What made you smile today?",
    "source": "whatsapp"
  }
}
```

### Update Entry
```http
PATCH /entries/:id
```

**Request Body:**
```json
{
  "content": "Updated content..."
}
```

**Response:** `200 OK`
```json
{
  "id": "ent_xyz789",
  "content": "Updated content...",
  "createdAt": "2024-01-14T15:30:00Z",
  "updatedAt": "2024-01-14T16:00:00Z",
  "metadata": {
    "prompt": "What made you smile today?",
    "source": "whatsapp"
  }
}
```

### Delete Entry
```http
DELETE /entries/:id
```

**Response:** `204 No Content`

## User Preferences

### Get Preferences
```http
GET /preferences
```

**Response:** `200 OK`
```json
{
  "promptTime": "18:00",
  "timezone": "America/New_York",
  "promptCategories": ["reflection", "gratitude"],
  "notificationPreferences": {
    "platform": "whatsapp",
    "reminders": true,
    "weeklyDigest": true
  }
}
```

### Update Preferences
```http
PATCH /preferences
```

**Request Body:**
```json
{
  "promptTime": "19:00",
  "notificationPreferences": {
    "reminders": false
  }
}
```

**Response:** `200 OK`
```json
{
  "promptTime": "19:00",
  "timezone": "America/New_York",
  "promptCategories": ["reflection", "gratitude"],
  "notificationPreferences": {
    "platform": "whatsapp",
    "reminders": false,
    "weeklyDigest": true
  }
}
```

## Analytics

### Get Entry Statistics
```http
GET /analytics/entries
```

**Query Parameters:**
- `from` (optional): ISO date string
- `to` (optional): ISO date string

**Response:** `200 OK`
```json
{
  "totalEntries": 150,
  "averageLength": 245,
  "streakDays": 7,
  "completionRate": 0.95,
  "byDay": {
    "Monday": 25,
    "Tuesday": 22,
    "Wednesday": 24,
    "Thursday": 26,
    "Friday": 23,
    "Saturday": 15,
    "Sunday": 15
  }
}
```

### Get Monthly Summary
```http
GET /analytics/monthly-summary
```

**Query Parameters:**
- `month`: YYYY-MM

**Response:** `200 OK`
```json
{
  "month": "2024-01",
  "totalEntries": 28,
  "completionRate": 0.90,
  "topWords": [
    {"word": "family", "count": 15},
    {"word": "work", "count": 12},
    {"word": "happy", "count": 10}
  ],
  "moodAnalysis": {
    "positive": 0.65,
    "neutral": 0.25,
    "negative": 0.10
  }
}
```

## Webhooks

### WhatsApp Message Webhook
```http
POST /webhooks/whatsapp
```

**Request Body:**
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "12345678901",
          "text": {
            "body": "Today I learned something new..."
          }
        }]
      }
    }]
  }]
}
```

**Response:** `200 OK`
```json
{
  "received": true
}
```

## Error Handling

### Error Response Format
All error responses follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error context"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Valid auth but insufficient permissions |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request parameters |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

### Example Error Responses

#### Validation Error
```http
POST /entries
```

**Request Body:**
```json
{
  "content": "" // Empty content
}
```

**Response:** `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "content": "Content cannot be empty"
    }
  }
}
```

#### Authentication Error
**Response:** `401 Unauthorized`
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid authentication token"
  }
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705241400
```

## Versioning

The API uses URL versioning. The current version is `v1`.
Breaking changes will be introduced in new API versions.
The `v1` API will be supported for at least 12 months after `v2` is released.

## SDK Examples

### JavaScript/TypeScript
```typescript
import { MicroJournal } from '@microjournal/sdk';

const client = new MicroJournal({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.microjournal.app/v1'
});

// Create entry
const entry = await client.entries.create({
  content: 'Today was productive...'
});

// Get entries
const { entries, pagination } = await client.entries.list({
  from: '2024-01-01',
  limit: 20
});

// Update preferences
await client.preferences.update({
  promptTime: '19:00'
});
```

### Python
```python
from microjournal import MicroJournal

client = MicroJournal(
    api_key='your_api_key',
    base_url='https://api.microjournal.app/v1'
)

# Create entry
entry = client.entries.create(
    content='Today was productive...'
)

# Get entries
entries = client.entries.list(
    from_date='2024-01-01',
    limit=20
)

# Update preferences
client.preferences.update(
    prompt_time='19:00'
)
```

## Testing

### Test Environment
```
Base URL: https://api-test.microjournal.app/v1
```

Test API keys are available in the developer dashboard.
Test environment data is automatically reset every 24 hours.

### Test Cards
For testing payment functionality:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Changelog

### v1.1.0 (2024-01-14)
- Added monthly analytics endpoint
- Improved rate limiting headers
- Added support for bulk entry creation

### v1.0.0 (2024-01-01)
- Initial API release
