# Development Guidelines

## Core Principles

1. **Simplicity First**
   - Self-contained components where possible
   - Minimal prop drilling
   - Direct state management
   - Built-in transitions and animations

2. **File Structure**
```
src/
├── app/                 # Next.js app router pages
│   ├── page.tsx        # Root redirect
│   ├── onboarding/     # Onboarding flow
│   ├── auth/           # Authentication pages
│   └── journal/        # Main journal features
├── components/         # Shared components
│   └── ui/            # Basic UI components
├── lib/               # Utility functions
├── styles/            # Global styles
└── types/             # TypeScript definitions
```

3. **Component Pattern**
```typescript
// Self-contained component example
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from 'lucide-react';

interface ComponentProps {
  // Clear, minimal props
}

export default function Component({ ...props }: ComponentProps) {
  // State at top level
  const [state, setState] = useState();
  const router = useRouter();

  // Handlers next
  const handleAction = () => {
    // Implementation
  };

  // Single return with logical grouping of elements
  return (
    <div className="containing-element">
      {/* Logical groups of UI elements */}
      <div className="header-section">
        {/* Header content */}
      </div>

      <div className="main-content">
        {/* Main content */}
      </div>

      <div className="actions-section">
        {/* Actions */}
      </div>
    </div>
  );
}
```

## Styling Guidelines

1. **Tailwind Usage**
```typescript
// Preferred pattern
className="flex flex-col items-center justify-center p-6"

// Group related utilities
className={`
  // Layout
  flex flex-col
  items-center 
  justify-center

  // Spacing
  p-6 
  space-y-4

  // Visual
  bg-white 
  rounded-lg 
  shadow-sm
`}
```

2. **Color System**
```typescript
// Core colors
const colors = {
  primary: 'orange-500',    // Main actions
  secondary: 'gray-600',    // Secondary elements
  success: 'green-500',     // Success states
  error: 'red-500',         // Error states
  background: 'white',      // Page background
  text: {
    primary: 'gray-900',    // Main text
    secondary: 'gray-600',  // Secondary text
    muted: 'gray-400'       // Muted text
  }
};
```

3. **Animation Standards**
```typescript
// Transition classes
const transitions = {
  default: 'transition-all duration-300',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-500'
};
```

## State Management

1. **Local State Pattern**
```typescript
// Prefer local state when possible
const [state, setState] = useState(initialValue);

// Use reducers for complex state
const [state, dispatch] = useReducer(reducer, initialState);
```

2. **Data Fetching**
```typescript
// Server Components (preferred)
async function Component() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Components (when needed)
function Component() {
  const { data, isLoading } = useQuery(['key'], fetchData);
  return <div>{isLoading ? 'Loading...' : data}</div>;
}
```

## Testing Strategy

1. **Component Testing**
```typescript
describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const onAction = jest.fn();
    render(<Component onAction={onAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

2. **Integration Testing**
```typescript
test('complete user flow', async () => {
  render(<App />);
  
  // Navigate through steps
  await userEvent.click(screen.getByText('Continue'));
  expect(screen.getByText('Step 2')).toBeInTheDocument();
  
  // Complete flow
  await userEvent.click(screen.getByText('Get Started'));
  expect(screen.getByText('Welcome')).toBeInTheDocument();
});
```

## Performance Guidelines

1. **Component Optimization**
```typescript
// Use memo for expensive components
const MemoizedComponent = memo(Component);

// Use callbacks for functions passed as props
const handleClick = useCallback(() => {
  // Implementation
}, [dependencies]);
```

2. **Loading Strategy**
```typescript
// Route groups for code splitting
app/
├── (auth)/             # Authentication routes
├── (main)/            # Main app routes
└── (marketing)/       # Marketing pages
```

## Documentation Standards

1. **Component Documentation**
```typescript
/**
 * @component ComponentName
 * @description Brief description of the component's purpose
 *
 * @example
 * ```tsx
 * <ComponentName
 *   prop1="value"
 *   prop2={42}
 * />
 * ```
 */
```

2. **API Documentation**
```typescript
/**
 * @api functionName
 * @description What the function does
 *
 * @param {type} paramName - Parameter description
 * @returns {type} Return value description
 *
 * @example
 * ```typescript
 * const result = functionName(params);
 * ```
 */
```

## Commit Guidelines

1. **Commit Message Format**
```
type(scope): description

[optional body]

[optional footer]
```

2. **Types**
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

## Code Review Checklist

1. **General**
- [ ] Follows component pattern
- [ ] Proper error handling
- [ ] Appropriate loading states
- [ ] Mobile responsive
- [ ] Accessible

2. **Performance**
- [ ] No unnecessary re-renders
- [ ] Optimized images/icons
- [ ] Efficient state management
- [ ] Proper code splitting

3. **Security**
- [ ] Input validation
- [ ] Proper authentication checks
- [ ] XSS prevention
- [ ] CSRF protection