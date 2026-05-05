/**
 * Production-ready logging middleware for the evaluation service.
 * Handles logging to the centralized log API with dynamic token injection.
 */

export type LogStack = 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
export type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';
export type LogPackage = FrontendPackage | SharedPackage;

export interface LogPayload {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
}

/**
 * Global Log function
 * @param stack - Must be 'frontend' for UI usage
 * @param level - Log severity
 * @param packageName - The specific package/module emitting the log
 * @param message - Descriptive log message
 */
export async function Log(
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string
): Promise<void> {
  const payload: LogPayload = {
    stack,
    level,
    package: packageName,
    message,
  };

  // Log to console for local debugging
  const consoleMethod = level === 'fatal' ? 'error' : level;
  const logFn = console[consoleMethod as keyof Console];
  if (typeof logFn === 'function') {
    (logFn as any).call(console, `[${packageName}] ${message}`, payload);
  }

  try {
    // Dynamically retrieve token from storage (standard practice for frontend tracking)
    // Note: In a real Next.js app, this might be handled by an API service wrapper
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (!token) {
      console.warn('Logger: No access token found. Log skipped.');
      return;
    }

    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Graceful failure: logging errors should never crash the main application
    console.error('Logger: Failed to send log to API', error);
  }
}
