# Firebase Diagnostics

This project includes Firebase diagnostics tools to help troubleshoot connection issues during development. These tools are not included in production builds.

## Using Firebase Diagnostics

### Toggle Diagnostics On/Off

We've created a script to easily toggle diagnostics on and off:

```bash
# Toggle diagnostics (enable if disabled, disable if enabled)
npm run toggle-diagnostics
```

When you run this command:
- If diagnostics are currently enabled, they will be disabled and backed up
- If diagnostics are currently disabled, they will be restored from backup

### Accessing Diagnostics

When diagnostics are enabled and you're in development mode:

1. The Firebase Diagnostics component will be available in your application
2. You can use it to check Firebase initialization status, connectivity, and more
3. It provides detailed error messages and recommendations for fixing issues

### Production Safeguards

Multiple safeguards ensure diagnostics don't appear in production:

1. The diagnostics files are added to `.gitignore` to prevent them from being committed
2. The layout file conditionally imports diagnostics only in development mode
3. A middleware redirects any attempts to access diagnostics routes in production
4. The toggle script allows you to easily remove diagnostics files before deployment

## Diagnostics Components

The diagnostics system consists of three main files:

1. `app/utils/firebaseDiagnostics.ts` - Core diagnostic functions
2. `app/components/FirebaseDiagnostics.tsx` - UI component for running diagnostics
3. `app/components/FirebaseDiagnosticsProvider.tsx` - Provider that adds diagnostics to the app

## Troubleshooting Common Firebase Issues

If you encounter Firebase connection issues:

1. Enable diagnostics using `npm run toggle-diagnostics`
2. Run the application in development mode
3. Use the diagnostics tool to identify specific issues
4. Follow the recommendations provided by the diagnostics
5. Once issues are resolved, you can disable diagnostics

## Security Note

The diagnostics tools are designed for development use only. They are automatically excluded from production builds for security reasons. Never manually add these files to production deployments. 