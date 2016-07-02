"use strict";

const assert = require("assert");

const PerInjectionPolicy = requireSrc("policies", "per-injection");

describe("policies", function () {
  describe("PerInjectionPolicy", function () {
    it("should conform", function () {
      assert(PerInjectionPolicy instanceof Function);
    });

    it("should cache values per injection", function () {
      const context1 = {injector: {}};
      const context2 = {injector: {}};
      const context3 = {injector: {}};

      const factory = () => ({});
      let   policy  = new PerInjectionPolicy();

      const value1 = policy.getValue(context1, factory);
      const value2 = policy.getValue(context2, factory);
      const value3 = policy.getValue(context3, factory);

      assert(value1 instanceof Object);
      assert(value2 instanceof Object);
      assert(value3 instanceof Object);

      assert(value1 !== value2);
      assert(value1 !== value3);
      assert(value2 !== value3);

      assert(policy.getValue(context1, factory) === value1);
      assert(policy.getValue(context1, factory) === value1);
      assert(policy.getValue(context1, factory) === value1);

      assert(policy.getValue(context2, factory) === value2);
      assert(policy.getValue(context2, factory) === value2);
      assert(policy.getValue(context2, factory) === value2);

      assert(policy.getValue(context3, factory) === value3);
      assert(policy.getValue(context3, factory) === value3);
      assert(policy.getValue(context3, factory) === value3);

      policy = new PerInjectionPolicy();

      assert(policy.getValue(context1, factory) === value1);
      assert(policy.getValue(context1, factory) === value1);
      assert(policy.getValue(context1, factory) === value1);

      assert(policy.getValue(context2, factory) === value2);
      assert(policy.getValue(context2, factory) === value2);
      assert(policy.getValue(context2, factory) === value2);

      assert(policy.getValue(context3, factory) === value3);
      assert(policy.getValue(context3, factory) === value3);
      assert(policy.getValue(context3, factory) === value3);
    });
  });
});
