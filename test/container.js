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
});
