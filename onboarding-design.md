# Onboarding Design System

## Color Palette
```css
:root {
  --primary: #FF7B5F;     /* Coral accent color */
  --background: #1A1A1A;  /* Dark background */
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.7);
}
```

## Typography
```css
/* Headings */
.heading-large {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Body Text */
.body-text {
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-secondary);
}
```

## Components

### Onboarding Screen
```typescript
interface OnboardingScreenProps {
  title: string;
  description: string;
  illustration: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  title,
  description,
  illustration,
  currentStep,
  totalSteps,
  onNext,
  onSkip
}) => (
  <div className="h-screen bg-[#1A1A1A] text-white p-6 flex flex-col">
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Illustration */}
        <div className="mb-8">
          {illustration}
        </div>
        
        {/* Content */}
        <h1 className="text-2xl font-bold mb-2">
          {title}
        </h1>
        <p className="text-gray-400 mb-8">
          {description}
        </p>
        
        {/* Navigation */}
        <div className="flex justify-between items-center mt-auto">
          <button 
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Skip
          </button>
          <button 
            onClick={onNext}
            className="bg-[#FF7B5F] px-6 py-2 rounded-full flex items-center"
          >
            Next
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
        
        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === currentStep 
                  ? 'bg-[#FF7B5F]' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);
```

2. **Calendar/Journal Views (Images 2 & 3)**
The calendar designs show:
- Clean, minimalist layouts
- Strong typography hierarchy
- Grid-based layouts
- Ample white space
- Clear date hierarchy

Let's create a component for the journal view:

```typescript
interface JournalViewProps {
  month: string;
  year: number;
  entries: JournalEntry[];
  notes: string;
}

const JournalView: React.FC<JournalViewProps> = ({
  month,
  year,
  entries,
  notes
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
    {/* Monthly Calendar */}
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">{month}</h2>
      <div className="grid grid-cols-7 gap-1">
        {/* Calendar grid */}
      </div>
    </div>
    
    {/* Weekly View */}
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Week View</h2>
      <div className="space-y-4">
        {/* Weekly entries */}
      </div>
    </div>
    
    {/* Monthly Notes */}
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Monthly notes.</h2>
      <textarea 
        className="w-full h-48 p-4 border rounded-lg resize-none"
        placeholder="Write your monthly reflections..."
        value={notes}
      />
    </div>
  </div>
);
```

To get started in Cursor, we should:

1. Initialize the project:
```bash
npx create-next-app@latest micro-journal --typescript --tailwind --eslint
```

2. Set up the initial file structure:
```
src/
  app/
  components/
    onboarding/
    journal/
    ui/
  styles/
  lib/
```

3. Install additional dependencies:
```bash
npm install @supabase/supabase-js date-fns lucide-react
```

Would you like me to help you get started with any specific part of the implementation in Cursor?