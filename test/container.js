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
});
