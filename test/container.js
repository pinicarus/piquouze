"use strict";

const assert = require("assert");

const Container          = requireSrc("container");
const NeverPolicy        = requireSrc("policies", "never");
const PerInjectionPolicy = requireSrc("policies", "per-injection");

describe("Container", function () {
  const mark = (inject, functor) => {
    functor.$inject = inject;
    return functor;
  };

  it("should conform", function () {
    assert(Container instanceof Function);
  });

  it("should check registerFactory functor type", function () {
    const container = new Container();

    assert.throws(() => container.registerFactory("a", "b"), TypeError);
  });

  it("should check registerFactory policy type", function () {
    const container = new Container();

    container.registerFactory("a", () => {});
    container.registerFactory("a", () => {}, new NeverPolicy());
    assert.throws(() => container.registerFactory("a", () => {}, 1), TypeError);
  });

  it("should check inject functor type", function () {
    const container = new Container();

    assert.throws(() => container.inject("a"), TypeError);
  });

  it("should allow registry of named factories", function () {
    const container = new Container();

    container.registerFactory(function f () { return 1; });
    container.registerFactory(function g () { return 2; }, new NeverPolicy());
    container.registerFactory("h", function x () { return 3; });

    const values = container.inject((f, g, h) => [f, g, h]);

    assert.deepEqual(values(), [1, 2, 3]);
  });

  it("should fail to register anonymous factories w/o name", function () {
    const container = new Container();

    assert.throws(() => container.registerFactory(() => {}), TypeError);
  });

  it("should allow policy sharing", function () {
    const container = new Container();
    const policy    = new PerInjectionPolicy();

    container.registerFactory("a", () => ({}), policy);
    container.registerFactory("x", () => ({}), policy);

    const functor = mark(["a", "a", "x", "x"], (a, b, c, d) => [a, b, c, d]);
    const values1 = container.inject(functor)();

    assert(values1[0] === values1[1]);
    assert(values1[0] !== values1[2]);
    assert(values1[0] !== values1[3]);
    assert(values1[2] === values1[3]);

    const values2 = container.inject(functor)();

    assert(values2[0] === values2[1]);
    assert(values2[0] !== values2[2]);
    assert(values2[0] !== values2[3]);
    assert(values2[2] === values2[3]);

    assert(values1[0] !== values2[0]);
    assert(values1[2] !== values2[0]);
    assert(values1[2] !== values2[2]);
  });

  it("should create child container", function () {
    const container = new Container();

    assert(container instanceof Container);
    assert(container.createChild() instanceof Container);
  });

  it("should resolve dependencies", function () {
    const container = new Container();

    container.registerValue("a", 1);
    container.registerValue("b", (a) => a * 2);
    container.registerFactory("c", (a, b) => b(a));

    const functor = container.inject((c) => c);

    assert(functor instanceof Function);
    assert.equal(functor(), 2);
  });

  it("should resolve dependencies hierarchy", function () {
    const parent = new Container();
    const child  = parent.createChild();

    parent.registerValue("a", 1);
    parent.registerFactory("b", (a) => a * 2);

    child.registerValue("a", 2);

    assert.equal(parent.inject((b) => b)(), 2);
    assert.equal(child.inject((b) => b)(), 4);
  });

  it("should resolve undefined dependency", function () {
    const container = new Container();

    container.registerValue("a", undefined);

    const functor = container.inject((a) => a);

    assert.equal(functor(), undefined);
  });

  it("should resolve null dependency", function () {
    const container = new Container();

    container.registerValue("a", null);

    const functor = container.inject((a) => a);

    assert.equal(functor(), null);
  });

  it("should resolve false dependency", function () {
    const container = new Container();

    container.registerValue("a", false);

    const functor = container.inject((a) => a);

    assert.equal(functor(), false);
  });

  it("should resolve true dependency", function () {
    const container = new Container();

    container.registerValue("a", true);

    const functor = container.inject((a) => a);

    assert.equal(functor(), true);
  });

  it("should resolve number dependency", function () {
    const container = new Container();

    container.registerValue("a", 1);

    const functor = container.inject((a) => a);

    assert.equal(functor(), 1);
  });

  it("should resolve symbol dependency", function () {
    const container = new Container();
    const symbol    = Symbol("a");

    container.registerValue("a", symbol);

    const functor = container.inject((a) => a);

    assert.equal(functor(), symbol);
  });

  it("should resolve string dependency", function () {
    const container = new Container();

    container.registerValue("a", "b");

    const functor = container.inject((a) => a);

    assert.equal(functor(), "b");
  });

  it("should resolve date dependency", function () {
    const container = new Container();
    const now       = new Date();

    container.registerValue("a", now);

    const functor = container.inject((a) => a);

    assert.equal(functor(), now);
  });

  it("should resolve regexp dependency", function () {
    const container = new Container();
    const re        = /re/;

    container.registerValue("a", re);

    const functor = container.inject((a) => a);

    assert.equal(functor(), re);
  });

  it("should allow functions to return undefined", function () {
    const container = new Container();
    const functor   = container.inject(function () { return undefined; });

    assert.equal(functor(), undefined);
  });

  it("should allow functions to return null", function () {
    const container = new Container();
    const functor   = container.inject(function () { return null; });

    assert.equal(functor(), null);
  });

  it("should allow functions to return false", function () {
    const container = new Container();
    const functor   = container.inject(function () { return false; });

    assert.equal(functor(), false);
  });

  it("should allow functions to return true", function () {
    const container = new Container();
    const functor   = container.inject(function () { return true; });

    assert.equal(functor(), true);
  });

  it("should allow functions to return number", function () {
    const container = new Container();
    const functor   = container.inject(function () { return 1; });

    assert.equal(functor(), 1);
  });

  it("should allow functions to return string", function () {
    const container = new Container();
    const functor   = container.inject(function () { return "foo"; });

    assert.equal(functor(), "foo");
  });

  it("should allow functions to be constructors", function () {
    const constructor = function () { this.a = 1; };
    const container   = new Container();
    const functor     = container.inject(constructor);
    const instance    = functor();

    assert(instance instanceof constructor);
    assert.equal(instance.a, 1);
  });

  it("should allow functions to be constructors returning this", function () {
    const constructor = function () { return this; };
    const container   = new Container();
    const functor     = container.inject(constructor);
    const instance    = functor();

    assert(instance instanceof constructor);
  });

  it("should allow functions to be constructors returning value", function () {
    const constructor = function () {
      this.a = 1;
      return "foo";
    };

    const container = new Container();
    const functor   = container.inject(constructor);
    const instance  = functor();

    assert(instance instanceof constructor);
    assert.equal(instance.a, 1);
  });

  it("should allow functions to be use this and return object", function () {
    const constructor = function () {
      this.a = 1;
      return {b: 2};
    };

    const container = new Container();
    const functor   = container.inject(constructor);
    const instance  = functor();

    assert(!(instance instanceof constructor));
    assert.deepEqual(instance, {b: 2});
  });

  it("should resolve with extra dependencies", function () {
    const container = new Container();

    container.registerValue("a", 1);

    const functor = container.inject((a, b) => [a, b], {b: 2});

    assert.deepEqual(functor(), [1, 2]);
    assert.throws(() => container.inject((a, b) => [a, b]));
  });

  describe("iteration", function () {
    const collect = (iterable) => {
      let entries = [];

      for(const entry of iterable) {
        entries.push(entry);
      }
      return entries.sort((entryA, entryB) => {
        const keyA = entryA[0];
        const keyB = entryB[0];

        switch (true) {
        case keyA < keyB: return -1;
        case keyA > keyB: return 1;
        default: return 0;
        }
      });
    };

    it("should iterate over own entries", function () {
      const parent = new Container();
      parent.registerValue("a", 1);
      parent.registerValue("b", 2);

      const child  = parent.createChild();
      child.registerValue("c", 3);
      child.registerValue("d", 4);

      assert.deepEqual([["a", 1], ["b", 2]], collect(parent.getOwnEntries()));
      assert.deepEqual([["c", 3], ["d", 4]], collect(child.getOwnEntries()));
    });

    it("should iterate over all entries", function () {
      const parent = new Container();
      parent.registerValue("a", 1);
      parent.registerValue("b", 2);

      const child  = parent.createChild();
      child.registerValue("c", 3);
      child.registerValue("d", 4);

      assert.deepEqual([["a", 1], ["b", 2]], collect(parent.getEntries()));
      assert.deepEqual([["a", 1], ["b", 2], ["c", 3], ["d", 4]],
        collect(child.getEntries()));
    });

    it("should return reference entry values", function () {
      const reference = {};
      const container = new Container();

      container.registerValue("a", reference);
      assert.strictEqual(reference, collect(container.getOwnEntries())[0][1]);
    });

    it("should return factory entries", function () {
      const functor   = function f(){};
      const container = new Container();

      container.registerFactory(functor);
      assert.deepEqual([["f", functor]], collect(container.getOwnEntries()));
    });
  });
});
