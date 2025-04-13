# Testing Strategy

## Testing Philosophy

Our testing approach focuses on practical coverage with an emphasis on user flows and critical paths. We prioritize integration tests over unit tests where appropriate.

### Core Principles
- Focus on user flows
- Integration testing for critical paths
- Simple, maintainable test cases
- Automated CI/CD integration

### Core Principles
1. **Automation First**
   - All tests must be automated
   - No manual testing steps in CI/CD pipeline
   - Automated reporting and metrics

2. **Shift Left Testing**
   - Tests written before or alongside code
   - Early defect detection
   - Integrated into development workflow

3. **Coverage Requirements**
   - Unit Tests: 90% coverage minimum
   - Integration Tests: 80% coverage minimum
   - E2E Tests: All critical user paths covered

## Test Implementation

### Unit Tests

```typescript
// Example User Service Test
describe('UserService', () => {
  let userService: UserService;
  let mockDb: MockDatabase;

  beforeEach(() => {
    mockDb = new MockDatabase();
    userService = new UserService(mockDb);
  });

  describe('createUser', () => {
    it('should create a new user with correct defaults', async () => {
      const userData = {
        email: 'test@example.com',
        phoneNumber: '+1234567890'
      };

      const user = await userService.createUser(userData);

      expect(user).toEqual({
        ...userData,
        id: expect.any(String),
        createdAt: expect.any(Date),
        status: 'active',
        isVerified: false
      });
    });

    it('should throw on duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        phoneNumber: '+1234567890'
      };

      await mockDb.users.create(userData);

      await expect(
        userService.createUser(userData)
      ).rejects.toThrow('User already exists');
    });
  });
});

// Example Journal Entry Validation Test
describe('JournalEntryValidator', () => {
  const validator = new JournalEntryValidator();

  describe('validateContent', () => {
    it('should enforce character limit', () => {
      const longContent = 'a'.repeat(1001);
      expect(() => 
        validator.validateContent(longContent)
      ).toThrow('Content exceeds maximum length');
    });

    it('should sanitize HTML', () => {
      const content = '<script>alert("xss")</script>Hello';
      const sanitized = validator.validateContent(content);
      expect(sanitized).toBe('Hello');
    });
  });
});
```

### Integration Tests

```typescript
// Example API Integration Test
describe('Journal API', () => {
  let app: Express;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await TestDatabase.create();
    app = createApp({ db: testDb });
  });

  afterAll(async () => {
    await testDb.destroy();
  });

  describe('POST /api/entries', () => {
    it('should create and retrieve journal entry', async () => {
      const user = await createTestUser(testDb);
      const token = generateAuthToken(user);

      // Create entry
      const createResponse = await request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Test journal entry'
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toMatchObject({
        content: 'Test journal entry',
        userId: user.id
      });

      // Verify retrieval
      const getResponse = await request(app)
        .get(`/api/entries/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toEqual(createResponse.body);
    });
  });
});
```

### E2E Tests

```typescript
// Example E2E Test with Playwright
import { test, expect } from '@playwright/test';

test.describe('Journal Entry Flow', () => {
  test('user can create and view journal entry', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Create entry
    await page.goto('/journal/new');
    await page.fill('[data-testid="entry-content"]', 'My test journal entry');
    await page.click('[data-testid="save-entry"]');
    
    // Verify entry appears in list
    await page.goto('/journal');
    await expect(
      page.locator('[data-testid="entry-content"]')
    ).toContainText('My test journal entry');
  });

  test('entry validation and error handling', async ({ page }) => {
    await page.goto('/journal/new');
    
    // Try to save empty entry
    await page.click('[data-testid="save-entry"]');
    await expect(
      page.locator('[data-testid="error-message"]')
    ).toBeVisible();
    
    // Try to exceed character limit
    await page.fill(
      '[data-testid="entry-content"]', 
      'a'.repeat(1001)
    );
    await expect(
      page.locator('[data-testid="character-count"]')
    ).toHaveClass(/error/);
  });
});
```

## Automated Test Pipeline

### GitHub Actions Configuration

```yaml
name: Test Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Type check
        run: npm run type-check
        
      - name: Unit tests
        run: npm run test:unit
        
      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          
      - name: E2E tests
        run: |
          npm run build
          npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        
      - name: Check coverage thresholds
        run: npm run coverage:check
```

### Test Database Management

```typescript
// Database Test Utilities
class TestDatabase {
  static async create() {
    const db = new TestDatabase();
    await db.migrate();
    await db.seed();
    return db;
  }

  async migrate() {
    await this.runMigrations();
    await this.createTestSchemas();
  }

  async seed() {
    await this.loadFixtures();
    await this.createTestData();
  }

  async cleanup() {
    await this.truncateTables();
    await this.resetSequences();
  }

  async destroy() {
    await this.dropTestSchemas();
    await this.close();
  }
}
```

## Continuous Testing

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:all"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests"
    ]
  }
}
```

### Watch Mode Configuration

```typescript
// jest.config.ts
export default {
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  watchPathIgnorePatterns: [
    'node_modules',
    'dist',
    'coverage'
  ],
  watchman: true
};
```

## Test Monitoring and Reporting

### Coverage Reports

```typescript
// jest.coverage.config.ts
export default {
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageReporters: [
    'text',
    'html',
    'lcov',
    'cobertura'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}'
  ]
};
```

### Performance Monitoring

```typescript
// playwright.config.ts
export default {
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  use: {
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
    }
  ]
};
```

## Test Data Management

### Factories and Fixtures

```typescript
// User Factory
export const createUser = factory({
  id: sequence((n) => `user_${n}`),
  email: sequence((n) => `user${n}@example.com`),
  phoneNumber: sequence((n) => `+1${n.toString().padStart(10, '0')}`),
  status: 'active',
  createdAt: () => new Date()
});

// Journal Entry Factory
export const createJournalEntry = factory({
  id: sequence((n) => `entry_${n}`),
  content: fake((f) => f.lorem.paragraph()),
  userId: association(createUser),
  createdAt: () => new Date()
});

// Test Data Seeding
export async function seedTestData() {
  const users = await createUser.createList(5);
  const entries = await Promise.all(
    users.map(user =>
      createJournalEntry.createList(3, { userId: user.id })
    )
  );
  return { users, entries: entries.flat() };
}
```

### API Mocks

```typescript
// WhatsApp API Mock
export const mockWhatsAppAPI = {
  sendMessage: jest.fn().mockResolvedValue({
    messageId: 'mock_message_id',
    status: 'sent'
  }),
  verifyWebhook: jest.fn().mockReturnValue(true)
};

// Test Setup
beforeEach(() => {
  jest.spyOn(WhatsAppClient.prototype, 'initialize')
    .mockResolvedValue(mockWhatsAppAPI);
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

## Security Testing

### Automated Security Scans

```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * *'
  push:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run SAST
        uses: github/codeql-action/analyze@v2
        
      - name: Run dependency scan
        run: npm audit
        
      - name: Run OWASP ZAP scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: 'https://staging.microjournal.app'
```

### Penetration Testing Automation

```typescript
// CSRF Token Validation Test
describe('CSRF Protection', () => {
  test('should reject requests without CSRF token', async ({ request }) => {
    const response = await request.post('/api/entries', {
      data: {
        content: 'Test entry'
      }
    });
    expect(response.status()).toBe(403);
  });
});

// XSS Prevention Test
describe('XSS Prevention', () => {
  test('should sanitize user input', async ({ page }) => {
    await page.goto('/journal/new');
    await page.fill(
      '[data-testid="entry-content"]',
      '<script>alert("xss")</script>'
    );
    await page.click('[data-testid="save-entry"]');
    
    const content = await page.textContent(
      '[data-testid="entry-content"]'
    );
    expect(content).not.toContain('<script>');
  });
});
```

## Performance Testing

### Load Testing

```typescript
// k6 Load Test Script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests within 500ms
    http_req_failed: ['rate<0.01']     // Less than 1% errors
  }
};

export default function () {
  const response = http.get('https://api.microjournal.app/health');
  check(response, {
    'is status 200': (r) => r.status === 200
  });
  sleep(1);
}
```

### Stress Testing

```typescript
// Artillery Config
config:
  target: 'https://api.microjournal.app'
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 50
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 50
      rampTo: 100
  defaults:
    headers:
      Authorization: "Bearer ${token}"

scenarios:
  - name: "Journal Entry Creation"
    flow:
      - post:
          url: "/api/entries"
          json:
            content: "Test journal entry"
      - think: 1
      - get:
          url: "/api/entries"
