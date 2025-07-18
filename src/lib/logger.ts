export function logApiRequest(endpoint: string, method: string, userId?: string) {
  console.log(`[${new Date().toISOString()}] ${method} ${endpoint} ${userId ? `User: ${userId}` : 'Anonymous'}`);
}

export function logApiError(endpoint: string, error: any, userId?: string) {
  console.error(`[${new Date().toISOString()}] ERROR ${endpoint} ${userId ? `User: ${userId}` : 'Anonymous'}`, error);
} 