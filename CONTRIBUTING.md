# Contributing to Knoux Clipboard AI

Thank you for your interest in contributing to Knoux Clipboard AI! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## 📜 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inspiring community for all.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm 8+
- Git
- Familiarity with TypeScript and React

### Setting Up Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/clipboard-ai.git
   cd clipboard-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Configure your .env file
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### Branch Naming Convention
```
feat/      - New features
fix/       - Bug fixes
docs/      - Documentation
style/     - Code style changes
refactor/  - Code refactoring
test/      - Adding tests
chore/     - Maintenance tasks
```

### Commit Message Format
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Examples:
```
feat(ai): add text classification endpoint
fix(clipboard): resolve memory leak in watcher
docs: update API documentation
```

## 🎨 Coding Standards

### TypeScript Standards
- Use strict TypeScript configuration
- All exports must have types
- Avoid `any` type when possible
- Use interfaces over type aliases for objects

### React Standards
- Use functional components with hooks
- PropTypes or TypeScript interfaces for props
- One component per file (except related sub-components)
- Use custom hooks for reusable logic

### File Structure
```
components/
  ComponentName/
    index.tsx        # Main component
    types.ts         # Type definitions
    styles.ts        # Component styles
    utils.ts         # Component utilities
    __tests__/       # Component tests
```

### Code Style
- Use ESLint and Prettier for formatting
- Maximum line length: 100 characters
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings

## 🧪 Testing

### Test Structure
```
__tests__/
  unit/              # Unit tests
  integration/       # Integration tests
  e2e/              # End-to-end tests
  fixtures/         # Test data
```

### Writing Tests
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

### Running Tests
```bash
# All tests
npm test

# Specific test file
npm test -- --testPathPattern=ClipboardWatcher

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📚 Documentation

### Code Documentation
- All functions and classes must have JSDoc comments
- Complex logic requires inline comments
- Update documentation when changing code

### API Documentation
- Document all endpoints with examples
- Include request/response schemas
- Document error cases

### User Documentation
- Write clear, concise instructions
- Include screenshots where helpful
- Update when adding features

## 🔀 Pull Request Process

### Creating a Pull Request
1. Update your fork with latest changes
2. Create a feature branch from `main`
3. Make your changes with tests and documentation
4. Ensure all tests pass
5. Update CHANGELOG.md if needed
6. Create pull request to `main`

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows project standards
- [ ] Self-reviewed code
- [ ] Commit messages follow conventions

## Testing Steps
1. Steps to test the changes
2. Expected results

## Screenshots
If applicable

## Related Issues
Closes #issue-number
```

### Review Process
- At least one maintainer must approve
- All checks must pass
- Code review feedback must be addressed
- Update documentation as needed

## 🚢 Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Release Steps
1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Build and test packages
6. Merge to main and tag release
7. Create GitHub release
8. Update documentation

## 🐛 Issue Reporting

### Bug Reports
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment**
- OS: [e.g., Windows 11]
- Node Version: [e.g., 18.12.0]
- App Version: [e.g., 1.0.0]

**Screenshots**
If applicable

**Additional Context**
Any other relevant information
```

### Feature Requests
```markdown
**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other solutions you considered

**Additional Context**
Any other relevant information
```

## 🤝 Community

### Getting Help
- Check [documentation](README.md) first
- Search existing issues
- Ask in [Discussions](https://github.com/knoux/clipboard-ai/discussions)
- Join our community chat

### Recognition
Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured in community highlights

## 📝 License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to Knoux Clipboard AI! 🎉
