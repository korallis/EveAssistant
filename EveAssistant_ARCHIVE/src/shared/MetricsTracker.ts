export class MetricsTracker {
  private metrics: Map<string, number[]>;

  constructor() {
    this.metrics = new Map();
  }

  public track(key: string, value: number): void {
    const values = this.metrics.get(key) || [];
    values.push(value);
    this.metrics.set(key, values);
  }

  public get(key: string): number[] {
    return this.metrics.get(key) || [];
  }
} 