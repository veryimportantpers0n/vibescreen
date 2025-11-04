# Testing Standards

## Test File Organization

### Directory Structure
- **All test files** must be stored in `/tests/` directory, not `/utils/`
- **Component tests** go in `/tests/components/`
- **Integration tests** go in `/tests/integration/`
- **Validation tests** go in `/tests/validation/`
- **Utility functions** stay in `/utils/` but only non-test utilities

### File Naming
- Component tests: `ComponentName.test.js`
- Integration tests: `featureName.integration.test.js`
- Validation tests: `featureName.validation.test.js`

### Development Server Issues
- **NEVER run `npm run dev` in automated processes** - it's a long-running command that blocks execution
- **Users must run `npm run dev` manually** in their own terminal window
- Use `npm run build` for testing production builds
- Use static file serving for testing, not dev server
- If dev server gets stuck, users should:
  1. Stop with Ctrl+C
  2. Clear Next.js cache: `rm -rf .next`
  3. Restart: `npm run dev`

### Development Workflow
- **For testing**: Use `npm run build` to create production build
- **For development**: User runs `npm run dev` in separate terminal
- **For deployment**: Use `npm run build && npm run export` for static files

### Test Execution
- Tests should be runnable with `npm test` or individual file execution
- No tests should depend on running development server
- All tests should work in CI/CD environments