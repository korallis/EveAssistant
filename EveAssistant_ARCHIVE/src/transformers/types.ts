export interface Transformer<T, U> {
  transform(data: T, options?: any): Promise<U>;
} 