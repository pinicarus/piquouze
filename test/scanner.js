"use strict";

const assert = require("assert");

const ScanError = requireSrc("errors", "scan");
const Scanner   = requireSrc("scanner");

describe("Scanner", function () {
  const _ = class {};

  it("should conform", function () {
    assert(Scanner instanceof Function);
  });

  describe("with 0 parameters", function () {
    it("should scan anonymous arrow function", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(() => {}), []);
    });

    it("should scan anonymous function", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(function () {}), []);
    });

    it("should scan named function", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(function f() {}), []);
    });

    it("should scan anonymous class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class {constructor() {}}), []);
    });

    it("should scan anonymous extending class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class extends _ {
        constructor() {
          super();
        }
      }), []);
    });

    it("should scan named class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class C {constructor() {}}), []);
    });

    it("should scan named extending class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class C extends _ {
        constructor() {
          super();
        }
      }), []);
    });

    it("should scan class not starting with constructor", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class {foo() {} constructor() {}}), []);
    });
  });

  describe("with 1 parameter", function () {
    it("should scan anonymous arrow function w/o parenthesis", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(a => {}), ["a"]);
    });

    it("should scan anonymous arrow function w/ parenthesis", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan((a) => {}), ["a"]);
    });

    it("should scan anonymous function", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(function (a) {}), ["a"]);
    });

    it("should scan named function", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(function f(a) {}), ["a"]);
    });

    it("should scan anonymous class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class {constructor(a) {}}), ["a"]);
    });

    it("should scan anonymous extending class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class extends _ {
        constructor(a) {
          super();
        }
      }), ["a"]);
    });

    it("should scan named class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class C {constructor(a) {}}), ["a"]);
    });

    it("should scan named extending class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class C extends _ {
        constructor(a) {
          super();
        }
      }), ["a"]);
    });

    it("should scan class not starting with constructor", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class {
        foo() {}
        constructor(a) {}
      }), ["a"]);
    });

    it("should not mistake constructor", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class {
        foo(b) {
          const constructor = (x) => {};

          constructor(b);
        }

        constructor(a) {}
      }), ["a"]);
    });
  });

  describe("with 2 parameters", function () {
    it("should scan anonymous arrow function", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan((a, b) => {}), ["a", "b"]);
    });

    it("should scan anonymous function", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(function (a, b) {}), ["a", "b"]);
    });

    it("should scan named function", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(function f(a, b) {}), ["a", "b"]);
    });

    it("should scan anonymous class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class {constructor(a, b) {}}), ["a", "b"]);
    });

    it("should scan anonymous extending class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class extends _ {
        constructor(a, b) {
          super();
        }
      }), ["a", "b"]);
    });

    it("should scan named class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class C {
        constructor(a, b) {}
      }), ["a", "b"]);
    });

    it("should scan named extending class", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class C extends _ {
        constructor(a, b) {
          super();
        }
      }), ["a", "b"]);
    });

    it("should scan class not starting with constructor", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class {
        foo() {}
        constructor(a, b) {}
      }), ["a", "b"]);
    });

    it("should not mistake constructor", function () {
      const scanner = new Scanner();

      assert.deepEqual(scanner.scan(class {
        foo(c, d) {
          const constructor = (x, y) => {};

          constructor(c, d);
        }

        constructor(a, b) {}
      }), ["a", "b"]);
    });
  });

  it("should fail to scan class with missing constructor", function () {
    const scanner = new Scanner();

    assert.throws(() => scanner.scan(class {}), ScanError);
  });
});
