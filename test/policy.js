"use strict";

const assert = require("assert");

const NotImplementedError = requireSrc("errors", "not-implemented");
const Policy              = requireSrc("policy");

describe("Policy", function () {
  it("should conform", function () {
    assert(Policy instanceof Function);
  });

  it("should throw on getValue", function () {
    const policy = new Policy();

    assert.throws(() => policy.getValue(), NotImplementedError);
  });
});
