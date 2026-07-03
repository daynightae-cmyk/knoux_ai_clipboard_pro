# Development Run Guide

## Quick Start

### Prerequisites
```bash
Node.js 16+ and npm 8+ installed
Git for version control
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd knoux-clipboard-ai

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration
```

## Development Commands

### Start Development Server
```bash
# Start both React dev server and Electron
npm run electron:dev

# Or run them separately
npm run dev        # React dev server only
npm start          # Electron only (requires built React app)
```

### Build Commands
```bash
# Build for production
npm run electron:build

# Build React app only
npm run build

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/clipboard.test.ts
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Check for issues
npm run doctor
```

## Development Workflow

### 1. Initial Setup
1. Install dependencies: `npm install`
2. Configure environment: `cp .env.example .env`
3. Add API keys to `.env`
4. Start development: `npm run electron:dev`

### 2. Daily Development
```bash
# Pull latest changes
git pull origin main

# Install new dependencies if needed
npm install

# Start development server
npm run electron:dev

# Make changes and test
# Commit changes
git add .
git commit -m "Description of changes"
git push origin feature-branch
```

### 3. Testing Changes
1. Run tests: `npm test`
2. Check linting: `npm run lint`
3. Type check: `npm run type-check`
4. Build test: `npm run build`

## Environment Setup

### Development Environment
```env
NODE_ENV=development
APP_DEBUG=true
DEV_TOOLS_ENABLED=true
HOT_RELOAD_ENABLED=true
```

### Testing Environment
```env
NODE_ENV=test
MOCK_AI_RESPONSES=true
SKIP_AUTHENTICATION=true
```

### Production Environment
```env
NODE_ENV=production
APP_DEBUG=false
DEV_TOOLS_ENABLED=false
AUTO_UPDATE_ENABLED=true
```

## Troubleshooting

### Common Issues

#### 1. Dependencies Installation
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Build Errors
```bash
# Clean build artifacts
npm run clean

# Reinstall dependencies
npm install

# Check TypeScript errors
npm run type-check
```

#### 3. Development Server Issues
```bash
# Kill processes on port 3000
npx kill-port 3000

# Clear Vite cache
rm -rf node_modules/.vite

# Restart development server
npm run electron:dev
```

#### 4. Database Issues
```bash
# Reset database (development only)
rm -rf data/knoux.db

# Backup database
cp data/knoux.db backups/knoux-$(date +%Y%m%d).db
```

## Debugging

### Chrome DevTools
- Press `Ctrl+Shift+I` in Electron app
- Or set `DEV_TOOLS_ENABLED=true` in `.env`

### Log Files
- Check `logs/` directory for application logs
- Enable debug logging: `LOG_LEVEL=debug`

### Process Monitoring
```bash
# List running processes
ps aux | grep electron

# Monitor resource usage
top -pid $(pgrep electron)
```

## Performance Tips

### Development
- Use `HOT_RELOAD_ENABLED=true` for faster updates
- Enable caching in development
- Monitor memory usage in DevTools

### Build Optimization
- Use production build for testing
- Enable source maps only in development
- Optimize image assets

## Deployment Testing

### Local Production Build
```bash
# Create production build
npm run electron:build

# Test the built application
./release/KNOUX Clipboard AI Setup.exe
```

### Update Testing
1. Bump version in `package.json`
2. Create release build
3. Test auto-update functionality

## Git Workflow

### Branch Structure
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation

### Commit Convention
```
feat: add new feature
fix: fix bug
docs: update documentation
style: code formatting
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## Additional Resources

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Testing Guide](docs/TESTING.md)
- [Security Guidelines](docs/SECURITY.md)

## Support

For issues and questions:
1. Check existing documentation
2. Search closed issues
3. Create new issue with details
4. Contact development team
