/**
 * Debug utility for safe console logging in production
 */
export const isDevelopment = () => {
  try {
    return import.meta.env.DEV === true;
  } catch {
    return false;
  }
};

export const debug = {
  log: (...args: any[]) => {
    if (isDevelopment()) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment()) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment()) {
      console.warn(...args);
    }
  }
};