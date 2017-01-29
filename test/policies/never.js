"use strict";

const assert = require("assert");

const NeverPolicy = requireSrc("policies", "never");

describe("policies", function () {
	describe("NeverPolicy", function () {
		it("should conform", function () {
			assert(NeverPolicy instanceof Function);
		});

		it("should not cache values", function () {
			const factory = () => ({});
			let   policy  = new NeverPolicy();

			const value1 = policy.getValue(undefined, factory);
			const value2 = policy.getValue(undefined, factory);
			const value3 = policy.getValue(undefined, factory);

			assert(value1 instanceof Object);
			assert(value2 instanceof Object);
			assert(value3 instanceof Object);

			assert(value1 !== value2);
			assert(value1 !== value3);
			assert(value2 !== value3);

			policy = new NeverPolicy();

			const value4 = policy.getValue(undefined, factory);
			const value5 = policy.getValue(undefined, factory);
			const value6 = policy.getValue(undefined, factory);

			assert(value1 !== value4);
			assert(value1 !== value5);
			assert(value1 !== value6);

			assert(value2 !== value4);
			assert(value2 !== value5);
			assert(value2 !== value6);

			assert(value3 !== value4);
			assert(value3 !== value5);
			assert(value3 !== value6);

			assert(value4 !== value5);
			assert(value4 !== value6);
			assert(value5 !== value6);
		});
	});
});
