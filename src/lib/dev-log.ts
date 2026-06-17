/** Client-side errors: log only in development (QA-020). */
export function devError(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
}
