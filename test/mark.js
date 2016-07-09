"use strict";

const assert = require("assert");

const mark = requireSrc("mark");

describe("mark", function () {
  it("should conform", function () {
    assert(mark instanceof Function);
  });

  describe("with 0 parameters", function () {
    it("should mark anonymous function", function () {
      const functor = function () {};

      mark(functor);
      assert.equal(functor.$kind, "function");
      assert.equal(functor.$name, undefined);
      assert.deepEqual(functor.$inject, []);
      assert.deepEqual(functor.$defaults, {});
    });

    it("should mark named function", function () {
      const functor = function f() {};

      mark(functor);
      assert.equal(functor.$kind, "function");
      assert.equal(functor.$name, "f");
      assert.deepEqual(functor.$inject, []);
      assert.deepEqual(functor.$defaults, {});
    });

    it("should mark arrow function", function () {
      const functor = () => {};

      mark(functor);
      assert.equal(functor.$kind, "arrow");
      assert.equal(functor.$name, undefined);
      assert.deepEqual(functor.$inject, []);
      assert.deepEqual(functor.$defaults, {});
    });
  });

  describe("with 1 parameter", function () {
    it("should mark anonymous function", function () {
      const functor = function (a) { return a; };

      mark(functor);
      assert.equal(functor.$kind, "function");
      assert.equal(functor.$name, undefined);
      assert.deepEqual(functor.$inject, ["a"]);
      assert.deepEqual(functor.$defaults, {});
    });

    it("should mark named function", function () {
      const functor = function f(a) { return a; };

      mark(functor);
      assert.equal(functor.$kind, "function");
      assert.equal(functor.$name, "f");
      assert.deepEqual(functor.$inject, ["a"]);
      assert.deepEqual(functor.$defaults, {});
    });

    it("should mark arrow function", function () {
      const functor = (a) => a;

      mark(functor);
      assert.equal(functor.$kind, "arrow");
      assert.equal(functor.$name, undefined);
      assert.deepEqual(functor.$inject, ["a"]);
      assert.deepEqual(functor.$defaults, {});
    });
  });

  describe("with 2 parameters", function () {
    it("should mark anonymous function", function () {
      const functor = function (a, b) { return [a, b]; };

      mark(functor);
      assert.equal(functor.$kind, "function");
      assert.equal(functor.$name, undefined);
      assert.deepEqual(functor.$inject, ["a", "b"]);
      assert.deepEqual(functor.$defaults, {});
    });

    it("should mark named function", function () {
      const functor = function f(a, b) { return [a, b]; };

      mark(functor);
      assert.equal(functor.$kind, "function");
      assert.equal(functor.$name, "f");
      assert.deepEqual(functor.$inject, ["a", "b"]);
      assert.deepEqual(functor.$defaults, {});
    });

    it("should mark arrow function", function () {
      const functor = (a, b) => [a, b];

      mark(functor);
      assert.equal(functor.$kind, "arrow");
      assert.equal(functor.$name, undefined);
      assert.deepEqual(functor.$inject, ["a", "b"]);
      assert.deepEqual(functor.$defaults, {});
    });
  });

  it("should accept given $kind", function () {
    const functor = (a, b, c) => [a, b, c];

    functor.$kind = "custom";
    mark(functor);
    assert.equal(functor.$kind, "custom");
    assert.deepEqual(functor.$defaults, {});
  });

  it("should accept given $name", function () {
    const functor = (a, b, c) => [a, b, c];

    functor.$name= "custom";
    mark(functor);
    assert.equal(functor.$name, "custom");
    assert.deepEqual(functor.$defaults, {});
  });

  it("should accept given $inject names", function () {
    const functor = (a, b, c) => [a, b, c];

    functor.$inject = ["d", "e", "f"];
    mark(functor);
    assert.deepEqual(functor.$inject, ["d", "e", "f"]);
    assert.deepEqual(functor.$defaults, {});
  });
});
