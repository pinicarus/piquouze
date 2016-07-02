"use strict";

const assert = require("assert");

const Container = requireSrc("container");
const NeverPolicy = requireSrc("policies", "never");

describe("Container", function () {
  it("should conform", function () {
    assert(Container instanceof Function);
  });

  it("should check policy type", function () {
    const container = new Container();

    container.registerFactory("a", () => {});
    container.registerFactory("a", () => {}, new NeverPolicy());
    assert.throws(() => container.registerFactory("a", () => {}, 1), TypeError);
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
