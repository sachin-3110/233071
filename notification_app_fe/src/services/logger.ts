import { ApiService } from './api';

export type LogStack = 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'middleware' | 'utils';

/**
 * Reusable logging function for the frontend application.
 * Wraps the ApiService.sendLog with convenience and token handling.
 */
export async function Log(
  level: LogLevel,
  packageName: LogPackage,
  message: string
): Promise<void> {
  const payload = {
    stack: 'frontend' as const,
    level,
    package: packageName,
    message,
  };

  // Local logging
  const consoleMethod = level === 'fatal' ? 'error' : level;
  const logFn = console[consoleMethod as keyof Console];
  if (typeof logFn === 'function') {
    (logFn as any).call(console, `[${packageName}] ${message}`, payload);
  }

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      await ApiService.sendLog({ ...payload, token });
    }
  } catch (error) {
    console.error('Logger failed:', error);
  }
}
