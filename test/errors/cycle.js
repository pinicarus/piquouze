"use strict";

const assert = require("assert");

const CycleError = requireSrc("errors", "cycle");

describe("errors", function () {
	it("should conform", function () {
		assert(CycleError instanceof Function);
	});

	it("should expose read-only cycle", function () {
		const cycle = ["a", "b", "a"];
		const error = new CycleError(cycle);

		assert.deepEqual(error.cycle, cycle);
		cycle[1] = "c";
		assert.notDeepEqual(error.cycle, cycle);
		error.cycle[1] = "b";
		assert.notDeepEqual(error.cycle, cycle);
	});
});
