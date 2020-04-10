/**
 * Interface that exposes standard math operations. Implementing types
 * can be used by other classes that require objects that support
 * these math operations.
 *
 * This interface and the techniques used here are required by JavaScript
 * does not support operator overloading and cannnot do things like:
 *
 * ```typescript
 * (a + b)
 * ```
 *
 * @remarks
 * Requires makes this generic to get around lack of covariance support
 * in TypeScript. For example, the code below would result in a type mismatch
 * error between IOperable and FieldElement.
 *
 * ```typescript
 * eq(other: FieldElement)
 * ```
 */
export interface IOperable<T> {
  eq(other: IOperable<T>): boolean;
  neq(other: IOperable<T>): boolean;
  add(other: IOperable<T>): IOperable<T>;
  sub(other: IOperable<T>): IOperable<T>;
  mul(other: IOperable<T>): IOperable<T>;
  div(other: IOperable<T>): IOperable<T>;
  pow(exponent: bigint): IOperable<T>;
  smul(scalar: bigint): IOperable<T>;
}
