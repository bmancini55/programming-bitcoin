# _Programming Bitcoin_ in TypeScript

This repository is a TypeScript implementattion of the Python code found in Jimmy Song's _Programming Bitcoin_ book. The structure of this code differs from the book in a few ways:

* The master branch is the completed code-base. I plan to add branches which have the completed code after each chapter for quick reference as you progress.
* Exercises are sprinkled throughout the unit tests instead of explicitly being called out. 
* Jupyter is not being used, tests and execises can be run with npm commands below.

## NPM Commands

__npm__ can be used to run several commands:
```
# runs all unit tests
npm test 

# run a network daemon that retrieves block header (chapter 10)
npm run start:10

# run a network daemon that retrieves merkle blocks (chapter 12)
npm run start:12
```


## Node.js 12+ Details

The book was originally coded with Python. Everything done in this repository is performed using TypeScript and Node.js 12+, even the Elliptic Curve code.

Here are some of the changes/challenges with porting to Node.js

* This port uses the [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) type to perform elliptic curve cryptography. This code is mostly found in [src/ecc](src/ecc). While BigInt finally allows us to do some neat stuff (and support 64-bit integers) it does not have constant time operations and is not suitable for cryptography. So this code is just an exercise.
* JavaScript does not support operator overloading (defining math operators +, \*, %, etc), so it is not possible to code something like `pointA + pointB` where each variable is a `S256Point` instance. Instead I created types that support interface-based math operations. [IOperable](https://github.com/bmancini55/coding-bitcoin/blob/master/src/ecc/Operable.ts) [IntElement](https://github.com/bmancini55/coding-bitcoin/blob/master/src/ecc/IntElement.ts) [FieldElement](https://github.com/bmancini55/coding-bitcoin/blob/master/src/ecc/FieldElement.ts)
* The Python example uses a `modpow` function to perform modular exponentiation efficiently. Neither BigInt nor Node.js have this capability. I created a `modpow` function that allows for efficient modular exponentiation of large numbers (such as those used in secp256k1). [modpow](https://github.com/bmancini55/coding-bitcoin/blob/master/src/util/BigIntMath.ts#L41)
* The `%` operator available to `BigInt` is actually the remainder operator, which means it allows negative numbers and is a problem for subtraction. A helper function was created that is heavily used in the ECC code. [mod](https://github.com/bmancini55/coding-bitcoin/blob/master/src/util/BigIntMath.ts#L18)
* There is not a `divmod` function, one has been added to return a tuple of the quotient and remainder. [divmod](https://github.com/bmancini55/coding-bitcoin/blob/master/src/util/BigIntMath.ts#L64)
* Node misses functionality for converting between `BigInt` and `Buffer`. I've create helper functions to easily go between the two. [bigToBuf, bigToBufLE, bigFromBuf, bigFromBufLE](https://github.com/bmancini55/coding-bitcoin/blob/master/src/util/BigIntUtil.ts)
* Most, but not all Script operations were added and can be found in [src/script/operations](src/script/operations). 
* Node.js TCP Sockets are asynchronous, this presents a few differences:
  * `SimpleNode` wraps the standard node `Socket` behavior and takes care of performing the handshake on connection. [connection](https://github.com/bmancini55/programming-bitcoin/blob/master/src/network/SimpleNode.ts#L61)
  * The socket operates in [paused mode](https://nodejs.org/api/stream.html#stream_two_reading_modes) which means that data is explicitly read from the socket stream.
  * For each message, the header is read and parsed first. If the full payload cannot be read in its entirety from the stream, the header is cached until more data is available on the stream. [SimpleNode.\_onReadable](https://github.com/bmancini55/programming-bitcoin/blob/master/src/network/SimpleNode.ts#L182)
  * Once a payload has been fully read and validated against the checksum, `SimpleNode` emits a parsed payload as a corresponding event. [event emission](https://github.com/bmancini55/programming-bitcoin/blob/master/src/network/SimpleNode.ts#L207)
* Because IO in Node.js is async, any code that requires fetching from remote sources has caused async methods to be sprinkled throughout the application (Tx.verifyInput, etc).
* MerkleBlock and MerkleTree construction were seperated into two classes to better help with understanding.
* MerkleTree construction uses a pointer implementation instead of the array-based algorithm in the book. I found both partial merkle block parsing and construction to be simpler this way. [Construction](https://github.com/bmancini55/programming-bitcoin/blob/master/src/MerkleTree.ts#L18) [Parsing](https://github.com/bmancini55/programming-bitcoin/blob/master/src/MerkleTree.ts#L61)

