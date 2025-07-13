declare module 'ml-regression-polynomial' {
  export default class PolynomialRegression {
    constructor(x: number[][], y: number[], degree: number);
    train(x: number[][], y: number[]): void;
    predict(x: number[]): number;
  }
} 