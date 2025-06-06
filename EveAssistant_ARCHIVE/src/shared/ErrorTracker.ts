export class ErrorTracker {
  public track(error: Error): void {
    console.error(`[Error]`, error);
  }
} 