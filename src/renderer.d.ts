export interface IDogma {
  traverseExpression: (expressionId: number) => void;
}

declare global {
  interface Window {
    dogma: IDogma;
  }
} 