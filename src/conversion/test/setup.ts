import { expect } from 'chai'
// Add a declaration to extend the global object
declare global {
  var expect: typeof import('chai').expect
}

(globalThis as any).expect = expect
