// Edge Runtime compatible logger
export const logInfo = (message: string, meta?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  }
};

export const logError = (message: string, error?: any, meta?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${message}`, error, meta ? JSON.stringify(meta) : '');
  }
};

export const logWarn = (message: string, meta?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  }
};

export const logDebug = (message: string, meta?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
  }
}; 