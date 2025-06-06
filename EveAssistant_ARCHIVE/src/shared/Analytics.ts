export class Analytics {
  public track(eventName: string, data: Record<string, any>): void {
    console.log(`[Analytics] Event: ${eventName}`, data);
  }
} 