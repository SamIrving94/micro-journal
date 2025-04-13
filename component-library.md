# Component Library Documentation

## Overview

This component library follows a simplified, maintainable approach with:
- Self-contained components
- Built-in animations and transitions
- Icon-based illustrations
- Consistent styling patterns

This component library follows atomic design principles, organizing components into:
- Atoms: Basic UI elements
- Molecules: Simple component combinations
- Organisms: Complex UI sections
- Templates: Page layouts
- Pages: Complete views

## Component Standards

### Component Structure
```typescript
// src/components/JournalEntry/JournalEntry.tsx
import { type FC } from 'react';
import styles from './JournalEntry.module.css';

interface JournalEntryProps {
  content: string;
  date: Date;
  tags?: string[];
  onEdit?: (id: string) => void;
}

export const JournalEntry: FC<JournalEntryProps> = ({
  content,
  date,
  tags = [],
  onEdit
}) => {
  return (
    <article className={styles.entry}>
      {/* Implementation */}
    </article>
  );
};

// Always export as named export
export default JournalEntry;
```

### Styling Guidelines
```typescript
// Use Tailwind utility classes
const Component = () => (
  <div className="flex flex-col space-y-4 p-4 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold text-gray-900">
      Title
    </h2>
  </div>
);

// For complex components, use CSS modules
// styles/JournalEntry.module.css
.entry {
  @apply flex flex-col space-y-4 p-4 rounded-lg shadow-md;
}

.entry__title {
  @apply text-xl font-semibold text-gray-900;
}
```

## Component Inventory

### Atoms

#### Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  onClick,
  children
}) => {
  const baseClasses = 'rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
};
```

#### Input
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password';
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export const Input: FC<InputProps> = ({
  type = 'text',
  label,
  error,
  value,
  onChange
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full px-3 py-2 border rounded-lg
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-500' : 'border-gray-300'}
      `}
    />
    {error && (
      <p className="text-sm text-red-600">{error}</p>
    )}
  </div>
);
```

### Molecules

#### JournalEntryCard
```typescript
interface JournalEntryCardProps {
  entry: {
    id: string;
    content: string;
    date: Date;
    tags?: string[];
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const JournalEntryCard: FC<JournalEntryCardProps> = ({
  entry,
  onEdit,
  onDelete
}) => (
  <div className="p-4 space-y-4 rounded-lg border border-gray-200">
    <div className="flex justify-between items-start">
      <time className="text-sm text-gray-500">
        {format(entry.date, 'PPP')}
      </time>
      <div className="space-x-2">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(entry.id)}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.id)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
    <p className="text-gray-900">{entry.content}</p>
    {entry.tags && entry.tags.length > 0 && (
      <div className="flex gap-2">
        {entry.tags.map(