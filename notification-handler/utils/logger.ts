export const logger = {
  info: (message: string, data?: Record<string, unknown>): void => {
    console.log(JSON.stringify({
      level: 'INFO',
      message,
      ...data,
    }));
  },

  error: (message: string, data?: Record<string, unknown>): void => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      ...data,
    }));
  },

  warn: (message: string, data?: Record<string, unknown>): void => {
    console.warn(JSON.stringify({
      level: 'WARN',
      message,
      ...data,
    }));
  },
};