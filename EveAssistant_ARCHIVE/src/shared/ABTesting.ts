export class ABTesting {
  private group: 'A' | 'B';

  constructor() {
    this.group = Math.random() < 0.5 ? 'A' : 'B';
  }

  public getGroup(): 'A' | 'B' {
    return this.group;
  }
} 