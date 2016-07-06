"use strict";

const assert = require("assert");

const ScanError = requireSrc("errors", "scan");

describe("errors", function () {
  it("should conform", function () {
    assert(ScanError instanceof Function);
  });

  it("should expose read-only functor", function () {
    const functor = () => {};
    const error   = new ScanError(functor);

    assert.equal(error.functor, functor);
    assert.throws(() => error.functor = () => {});
    assert.equal(error.functor, functor);
  });
});
