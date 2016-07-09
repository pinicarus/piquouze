"use strict";

const assert = require("assert");

const params = requireSrc("params");

describe("params", function () {
  it("should conform", function () {
    assert(params instanceof Function);
  });

  describe("optional parameter", function () {
    it("should return matching value", function () {
      const values = params(["foo"], [
        {type: String, default: "bar"},
      ], true);

      assert.deepEqual(values, ["foo"]);
    });

    it("should return undefined on empty parameters list", function () {
      const values = params([], [
        {type: String, default: "bar"},
      ], true);

      assert.deepEqual(values, ["bar"]);
    });

    it("should return undefined on wrong type", function () {
      const values = params([1], [
        {type: String, default: "bar"},
      ], false);

      assert.deepEqual(values, ["bar", 1]);
    });

    it("should fail on wrong strict type", function () {
      assert.throws(() => params([1], [
        {type: String, default: "bar"},
      ], true));
    });
  });

  describe("required parameter", function () {
    it("should return matching value", function () {
      const values = params(["foo"], [
        {type: String},
      ], true);

      assert.deepEqual(values, ["foo"]);
    });

    it("should throw on empty parameters list", function () {
      assert.throws(() => params([], [
        {type: String},
      ], true), TypeError);
    });

    it("should throw on wrong type", function () {
      assert.throws(() => params([1], [
        {type: String},
      ], true), TypeError);
    });
  });

  it("should match all types", function () {
    const parent = class {};
    const child  = class extends parent {};

    assert.doesNotThrow(() => params([
      undefined,
      null,
      false,
      1,
      "foo",
      Symbol(),
      {},
      [],
      new Date(),
      /^$/,
      new Error(),
      new Map(),
      new WeakMap(),
      new Set(),
      new WeakSet(),
      new Promise(() => {}),
      () => {},
      function () {},
      new parent(),
      new child(),
      new child(),
    ], [
      {type: undefined},
      {type: null},
      {type: Boolean},
      {type: Number},
      {type: String},
      {type: Symbol},
      {type: Object},
      {type: Array},
      {type: Date},
      {type: RegExp},
      {type: Error},
      {type: Map},
      {type: WeakMap},
      {type: Set},
      {type: WeakSet},
      {type: Promise},
      {type: Function},
      {type: Function},
      {type: parent},
      {type: parent},
      {type: child},
    ], true));
  });

  it("should allow to mix optional and required parameters", function () {
    const values = params([1, "foo"], [
      {type: Boolean, default: true},
      {type: Number},
      {type: Array, default: [false]},
      {type: String},
      {type: String, default: "bar"},
    ], true);

    assert.deepEqual(values, [true, 1, [false], "foo", "bar"]);
  });
});
