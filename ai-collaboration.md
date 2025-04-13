# AI Collaboration and Documentation Maintenance Guide

## Working with Claude in Cursor

### Best Practices for Feature Development

1. **Initial Feature Planning**
   ```markdown
   When starting a new feature, provide Claude with:
   - Feature specification
   - Relevant existing files
   - Documentation that needs updating
   - Test requirements
   ```

2. **Development Workflow**
   ```markdown
   For each feature:
   1. Create feature branch
   2. Share context with Claude:
      - File paths
      - Related components
      - Current implementation details
   3. Request specific assistance:
      - Code review
      - Test creation
      - Documentation updates
   ```

3. **Documentation Update Process**
   ```markdown
   After completing a feature:
   1. Run documentation check command
   2. Review affected documentation
   3. Update documentation with Claude
   4. Verify changes
   ```

### Automated Documentation Updates

1. **Pre-Commit Hook Setup**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for documentation markers in changed files
files=$(git diff --cached --name-only)
for file in $files; do
  if grep -l "@docUpdate" "$file" > /dev/null; then
    echo "Documentation update needed for $file"
    exit 1
  fi
done
```

2. **Documentation Markers**
```typescript
// Example component with documentation marker
/**
 * @docUpdate
 * Component: UserJournalEntry
 * Docs: components.md, api.md
 */
export function UserJournalEntry() {
  // Implementation
}
```

3. **Documentation Update Script**
```typescript
// scripts/update-docs.ts
import { glob } from 'glob';
import { readFile, writeFile } from 'fs/promises';

async function findDocumentationUpdates() {
  const files = await glob('src/**/*.{ts,tsx}');
  const updates = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const docMarkers = content.match(/@docUpdate\n \* ([^\n]+)/g);
    
    if (docMarkers) {
      updates.push({
        file,
        markers: docMarkers
      });
    }
  }

  return updates;
}

// Run as part of CI/CD pipeline
async function main() {
  const updates = await findDocumentationUpdates();
  if (updates.length > 0) {
    console.log('Documentation updates needed:', updates);
    process.exit(1);
  }
}
```

### Claude Prompting Patterns

1. **Feature Development Prompts**
```markdown
Context: Working on [Feature Name]
Files: 
- src/components/JournalEntry.tsx
- src/lib/journal.ts

Need assistance with:
1. Implementation of [specific functionality]
2. Test coverage
3. Documentation updates for:
   - API documentation
   - Component documentation
   - User guide
```

2. **Code Review Prompts**
```markdown
Please review the following changes:
[paste code diff]

Focus on:
1. Best practices
2. Performance implications
3. Security considerations
4. Documentation needs
```

3. **Documentation Update Prompts**
```markdown
Feature completed: [Feature Name]
Changes made:
1. [List key changes]
2. [New APIs added]
3. [Modified components]

Please help update:
1. API documentation
2. Component documentation
3. Development guidelines
```

### Documentation Maintenance Workflow

1. **Feature Documentation Checklist**
```markdown
For each feature:
[ ] Update API documentation
[ ] Update component documentation
[ ] Update development guidelines
[ ] Update testing documentation
[ ] Update deployment documentation
[ ] Review and validate changes
```

2. **Automated Documentation Review**
```typescript
// scripts/validate-docs.ts
import { execSync } from 'child_process';
import { glob } from 'glob';

async function validateDocumentation() {
  // Find all documentation files
  const docs = await glob('docs/**/*.md');
  
  // Check for outdated references
  const codebase = await glob('src/**/*.{ts,tsx}');
  
  // Validate links between documentation
  const brokenLinks = [];
  
  // Check for documentation coverage
  const coverage = calculateDocumentationCoverage();
  
  return {
    brokenLinks,
    coverage,
    outdatedRefs: []
  };
}
```

3. **Documentation Update PR Template**
```markdown
## Documentation Updates

### Changed Documentation Files
- [ ] API.md
- [ ] Components.md
- [ ] Development.md

### Type of Changes
- [ ] New feature documentation
- [ ] Updated existing documentation
- [ ] Fixed broken links/references
- [ ] Added examples/tutorials

### Validation
- [ ] Documentation builds successfully
- [ ] All links are valid
- [ ] Examples are up-to-date
- [ ] No broken references
```

### Integration with Development Workflow

1. **GitHub Actions Integration**
```yaml
name: Documentation Check

on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'src/**'
      - 'docs/**'

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check for documentation updates
        run: npm run docs:check
        
      - name: Validate documentation
        run: npm run docs:validate
        
      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.name,
              body: 'Documentation updates required'
            })
```

2. **VS Code Integration**
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.markdownlint": true
  },
  "markdownlint.config": {
    "MD013": false,
    "MD033": false
  },
  "markdown.validate.enabled": true
}
```

### Documentation Review Process

1. **Automated Checks**
```typescript
// Documentation validation rules
const validationRules = {
  // Check for dead links
  checkLinks: async (content: string) => {
    const links = extractLinks(content);
    return validateLinks(links);
  },
  
  // Check for outdated API references
  checkAPIRefs: async (content: string) => {
    const apiRefs = extractAPIRefs(content);
    return validateAPIRefs(apiRefs);
  },
  
  // Check for consistency in terminology
  checkTerminology: async (content: string) => {
    return validateTerminology(content);
  }
};
```

2. **Manual Review Guidelines**
```markdown
Documentation Review Checklist:
1. Technical Accuracy
   - [ ] All code examples are correct
   - [ ] API references are up-to-date
   - [ ] Configuration examples are valid

2. Clarity
   - [ ] Clear explanations
   - [ ] Proper formatting
   - [ ] Consistent terminology

3. Completeness
   - [ ] All features documented
   - [ ] Edge cases covered
   - [ ] Error scenarios explained
```

3. **Documentation Testing**
```typescript
// tests/docs.test.ts
describe('Documentation Tests', () => {
  test('API documentation matches implementation', async () => {
    const apiDocs = await readAPIDocumentation();
    const apiImplementation = await analyzeAPIImplementation();
    
    expect(apiDocs).toMatchImplementation(apiImplementation);
  });
  
  test('Component documentation is up-to-date', async () => {
    const componentDocs = await readComponentDocumentation();
    const components = await analyzeComponents();
    
    expect(componentDocs).toMatchComponents(components);
  });
});
```

### Best Practices for Documentation

1. **Code Documentation**
```typescript
/**
 * @component JournalEntry
 * @description Displays a single journal entry with metadata
 *
 * @example
 * ```tsx
 * <JournalEntry
 *   content="Today was great"
 *   date="2024-01-14"
 *   tags={['personal', 'highlight']}
 * />
 * ```
 *
 * @docUpdate Update component documentation when props change
 */
```

2. **API Documentation**
```typescript
/**
 * @api createJournalEntry
 * @description Creates a new journal entry
 *
 * @param {JournalEntryInput} input Entry data
 * @returns {Promise<JournalEntry>} Created entry
 *
 * @example
 * ```typescript
 * const entry = await createJournalEntry({
 *   content: 'Today was productive',
 *   tags: ['work']
 * });
 * ```
 *
 * @docUpdate Update API documentation when parameters change
 */
```

3. **Markdown Best Practices**
```markdown
# Component Name

## Overview
Brief description of the component's purpose

## Usage
```tsx
// Example usage code
```

## Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| prop1 | string | Yes | Description |

## Notes
Any additional information or considerations
```

Remember to:
1. Keep documentation close to code
2. Use consistent formatting
3. Include practical examples
4. Document edge cases
5. Keep documentation up-to-date
