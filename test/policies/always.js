"use strict";

const assert = require("assert");

const AlwaysPolicy = requireSrc("policies", "always");

describe("policies", function () {
	describe("AlwaysPolicy", function () {
		it("should conform", function () {
			assert(AlwaysPolicy instanceof Function);
		});

		it("should cache first value", function () {
			const factory = () => ({});
			let   policy  = new AlwaysPolicy();

			const value = policy.getValue({name: "factory"}, factory);
			assert(value instanceof Object);

			assert(policy.getValue({name: "factory"}, factory) === value);
			assert(policy.getValue({name: "factory"}, factory) === value);
			assert(policy.getValue({name: "factory"}, factory) === value);

			policy = new AlwaysPolicy();
			assert(policy.getValue({name: "factory"}, factory) === value);
			assert(policy.getValue({name: "factory"}, factory) === value);
			assert(policy.getValue({name: "factory"}, factory) === value);
		});
	});
});
