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
      const scanner = new Scanner(() => {});

      assert.equal(scanner.getKind(), "arrow");
      assert.deepEqual(scanner.getParams(), []);
    });

    it("should scan anonymous function", function () {
      const scanner = new Scanner(function () {});

      assert.equal(scanner.getKind(), "function");
      assert.deepEqual(scanner.getParams(), []);
    });

    it("should scan named function", function () {
      const scanner = new Scanner(function f() {});

      assert.equal(scanner.getKind(), "function");
      assert.deepEqual(scanner.getParams(), []);
    });

    it("should scan anonymous class", function () {
      const scanner = new Scanner(class {constructor() {}});

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), []);
    });

    it("should scan anonymous extending class", function () {
      const scanner = new Scanner(class extends _ {
        constructor() {
          super();
        }
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), []);
    });

    it("should scan named class", function () {
      const scanner = new Scanner(class C {constructor() {}});

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), []);
    });

    it("should scan named extending class", function () {
      const scanner = new Scanner(class C extends _ {
        constructor() {
          super();
        }
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), []);
    });

    it("should scan class not starting with constructor", function () {
      const scanner = new Scanner(class {
        foo() {}
        constructor() {}
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), []);
    });
  });

  describe("with 1 parameter", function () {
    it("should scan anonymous arrow function w/o parenthesis", function () {
      const scanner = new Scanner(a => {});

      assert.equal(scanner.getKind(), "arrow");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should scan anonymous arrow function w/ parenthesis", function () {
      const scanner = new Scanner((a) => {});

      assert.equal(scanner.getKind(), "arrow");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should scan anonymous function", function () {
      const scanner = new Scanner(function (a) {});

      assert.equal(scanner.getKind(), "function");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should scan named function", function () {
      const scanner = new Scanner(function f(a) {});

      assert.equal(scanner.getKind(), "function");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should scan anonymous class", function () {
      const scanner = new Scanner(class {constructor(a) {}});

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should scan anonymous extending class", function () {
      const scanner = new Scanner(class extends _ {
        constructor(a) {
          super();
        }
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should scan named class", function () {
      const scanner = new Scanner(class C {constructor(a) {}});

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should scan named extending class", function () {
      const scanner = new Scanner(class C extends _ {
        constructor(a) {
          super();
        }
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should scan class not starting with constructor", function () {
      const scanner = new Scanner(class {
        foo() {}

        constructor(a) {}
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });

    it("should not mistake constructor", function () {
      const scanner = new Scanner(class {
        foo(b) {
          const constructor = (x) => {};

          constructor(b);
        }

        constructor(a) {}
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a"]);
    });
  });

  describe("with 2 parameters", function () {
    it("should scan anonymous arrow function", function () {
      const scanner = new Scanner((a, b) => {});

      assert.equal(scanner.getKind(), "arrow");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });

    it("should scan anonymous function", function () {
      const scanner = new Scanner(function (a, b) {});

      assert.equal(scanner.getKind(), "function");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });

    it("should scan named function", function () {
      const scanner = new Scanner(function f(a, b) {});

      assert.equal(scanner.getKind(), "function");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });

    it("should scan anonymous class", function () {
      const scanner = new Scanner(class {
        constructor(a, b) {}
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });

    it("should scan anonymous extending class", function () {
      const scanner = new Scanner(class extends _ {
        constructor(a, b) {
          super();
        }
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });

    it("should scan named class", function () {
      const scanner = new Scanner(class C {constructor(a, b) {}});

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });

    it("should scan named extending class", function () {
      const scanner = new Scanner(class C extends _ {
        constructor(a, b) {
          super();
        }
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });

    it("should scan class not starting with constructor", function () {
      const scanner = new Scanner(class {
        foo() {}
        constructor(a, b) {}
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });

    it("should not mistake constructor", function () {
      const scanner = new Scanner(class {
        foo(c, d) {
          const constructor = (x, y) => {};

          constructor(c, d);
        }

        constructor(a, b) {}
      });

      assert.equal(scanner.getKind(), "class");
      assert.deepEqual(scanner.getParams(), ["a", "b"]);
    });
  });

  it("should fail to scan class with missing constructor", function () {
    assert.throws(() => new Scanner(class {}), ScanError);
  });

  it("should fail to scan non-functor", function () {
    assert.throws(() => new Scanner(42), ScanError);
  });
});
