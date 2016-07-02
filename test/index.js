"use strict";

const assert = require("assert");

const index = requireSrc("index");

describe("API", function () {
  it("should conform", function () {
    assert(index instanceof Object);
    assert(index.Container instanceof Function);
    assert(index.caching instanceof Object);
    assert(index.caching.Always instanceof Function);
    assert(index.caching.PerContainer instanceof Function);
    assert(index.caching.PerInjection instanceof Function);
    assert(index.caching.Never instanceof Function);
    assert(index.errors.Cycle instanceof Function);
    assert(index.errors.MissingDependency instanceof Function);
    assert(index.errors.NotImplemented instanceof Function);
  });

  it("should be immutable", function () {
    assert.throws(() => { index.x = true; }, TypeError);
    assert.throws(() => { index.caching.x = true; }, TypeError);
    assert.throws(() => { index.errors.x = true; }, TypeError);
  });
});
