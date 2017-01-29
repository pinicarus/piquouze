"use strict";

const assert = require("assert");

const MissingDependencyError = requireSrc("errors", "missing");

describe("errors", function () {
	it("should conform", function () {
		assert(MissingDependencyError instanceof Function);
	});

	it("should expose read-only missing dependency name", function () {
		const error = new MissingDependencyError("a");

		assert.equal(error.name, "a");
		assert.throws(() => error.name = "b", TypeError);
		assert.equal(error.name, "a");
	});
});
