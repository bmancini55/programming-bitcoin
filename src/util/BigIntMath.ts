/**
 * Returns the modulus of a % b as a real value in the range `0` to `b-1`.
 *
 * This function is reqiured because the `%` operator in JavaScript is the
 * remainder operation and not the modulus operator. The remainder operator
 * has different values for negative numbers. Negative numbers are frequently
 * encounter during subtraction. More [info](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Remainder).
 *
 * @example
 * ```typescript
 * mod(12, 5) === 2;
 * mod(-12, 5) === 3;
 * ```
 *
 * @param a
 * @param b
 */
export function mod(a: bigint, b: bigint) {
  return ((a % b) + b) % b;
}

// /**
//  * Performs modular exponentiation
//  * @param num
//  * @param exp
//  * @param mod
//  */
// export function exp(num: bigint, exp: bigint, mod: bigint) {}
