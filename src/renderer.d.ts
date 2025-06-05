export interface IDogma {
  traverseExpression: (expressionId: number) => void;
  getModules: () => Promise<any[]>;
}

declare global {
  interface Window {
    dogma: IDogma;
  }
} 