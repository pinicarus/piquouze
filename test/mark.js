"use strict";

const assert = require("assert");

const mark = requireSrc("mark");

describe("mark", function () {
  it("should conform", function () {
    assert(mark instanceof Function);
  });

  describe("with 0 parameters", function () {
    it("should mark function", function () {
      const functor = function () {};

      mark(functor);
      assert.deepEqual(functor.$inject, []);
    });

    it("should mark arrow function", function () {
      const functor = () => {};

      mark(functor);
      assert.deepEqual(functor.$inject, []);
    });
  });

  describe("with 1 parameter", function () {
    it("should mark function", function () {
      const functor = function (a) { return a; };

      mark(functor);
      assert.deepEqual(functor.$inject, ["a"]);
    });

    it("should mark arrow function", function () {
      const functor = (a) => a;

      mark(functor);
      assert.deepEqual(functor.$inject, ["a"]);
    });
  });

  describe("with 2 parameters", function () {
    it("should mark function", function () {
      const functor = function (a, b) { return [a, b]; };

      mark(functor);
      assert.deepEqual(functor.$inject, ["a", "b"]);
    });

    it("should mark arrow function", function () {
      const functor = (a, b) => [a, b];

      mark(functor);
      assert.deepEqual(functor.$inject, ["a", "b"]);
    });
  });

  it("should accept given $inject names", function () {
    const functor = (a, b, c) => [a, b, c];

    functor.$inject = ["d", "e", "f"];
    mark(functor);
    assert.deepEqual(functor.$inject, ["d", "e", "f"]);
  });
});
