"use strict";

const assert = require("assert");

const NotImplementedError = requireSrc("errors", "not-implemented");

describe("errors", function () {
  it("should conform", function () {
    assert(NotImplementedError instanceof Function);
  });

  it("should expose read-only not-implemented code name", function () {
    const error = new NotImplementedError("a");

    assert.equal(error.name, "a");
    assert.throws(() => error.name = "b", TypeError);
    assert.equal(error.name, "a");
  });
});
