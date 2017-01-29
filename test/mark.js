"use strict";

const assert = require("assert");

const mark = requireSrc("mark");

describe("mark", function () {
	it("should conform", function () {
		assert(mark instanceof Function);
	});

	describe("with 0 parameters", function () {
		it("should mark anonymous function", function () {
			const functor = function () {};
			const marking = mark(functor);

			assert.equal(marking.kind, "function");
			assert.equal(marking.name, undefined);
			assert.deepEqual(marking.inject, []);
			assert.deepEqual(marking.defaults, {});
		});

		it("should mark named function", function () {
			const functor = function f() {};
			const marking = mark(functor);

			assert.equal(marking.kind, "function");
			assert.equal(marking.name, "f");
			assert.deepEqual(marking.inject, []);
			assert.deepEqual(marking.defaults, {});
		});

		it("should mark arrow function", function () {
			const functor = () => {};
			const marking = mark(functor);

			assert.equal(marking.kind, "arrow");
			assert.equal(marking.name, undefined);
			assert.deepEqual(marking.inject, []);
			assert.deepEqual(marking.defaults, {});
		});
	});

	describe("with 1 parameter", function () {
		it("should mark anonymous function", function () {
			const functor = function (a) { return a; };
			const marking = mark(functor);

			assert.equal(marking.kind, "function");
			assert.equal(marking.name, undefined);
			assert.deepEqual(marking.inject, ["a"]);
			assert.deepEqual(marking.defaults, {});
		});

		it("should mark named function", function () {
			const functor = function f(a) { return a; };
			const marking = mark(functor);

			assert.equal(marking.kind, "function");
			assert.equal(marking.name, "f");
			assert.deepEqual(marking.inject, ["a"]);
			assert.deepEqual(marking.defaults, {});
		});

		it("should mark arrow function", function () {
			const functor = (a) => a;
			const marking = mark(functor);

			assert.equal(marking.kind, "arrow");
			assert.equal(marking.name, undefined);
			assert.deepEqual(marking.inject, ["a"]);
			assert.deepEqual(marking.defaults, {});
		});
	});

	describe("with 2 parameters", function () {
		it("should mark anonymous function", function () {
			const functor = function (a, b) { return [a, b]; };
			const marking = mark(functor);

			assert.equal(marking.kind, "function");
			assert.equal(marking.name, undefined);
			assert.deepEqual(marking.inject, ["a", "b"]);
			assert.deepEqual(marking.defaults, {});
		});

		it("should mark named function", function () {
			const functor = function f(a, b) { return [a, b]; };
			const marking = mark(functor);

			assert.equal(marking.kind, "function");
			assert.equal(marking.name, "f");
			assert.deepEqual(marking.inject, ["a", "b"]);
			assert.deepEqual(marking.defaults, {});
		});

		it("should mark arrow function", function () {
			const functor = (a, b) => [a, b];
			const marking = mark(functor);

			assert.equal(marking.kind, "arrow");
			assert.equal(marking.name, undefined);
			assert.deepEqual(marking.inject, ["a", "b"]);
			assert.deepEqual(marking.defaults, {});
		});
	});

	it("should accept given $kind", function () {
		const functor = (a, b, c) => [a, b, c];
		functor.$kind = "custom";
		const marking = mark(functor);

		assert.equal(marking.kind, "custom");
		assert.deepEqual(marking.defaults, {});
	});

	it("should accept given $name", function () {
		const functor = (a, b, c) => [a, b, c];
		functor.$name= "custom";
		const marking = mark(functor);

		assert.equal(marking.name, "custom");
		assert.deepEqual(marking.defaults, {});
	});

	it("should accept given $inject names", function () {
		const functor = (a, b, c) => [a, b, c];
		functor.$inject = ["d", "e", "f"];
		const marking = mark(functor);

		assert.deepEqual(marking.inject, ["d", "e", "f"]);
		assert.deepEqual(marking.defaults, {});
	});
});
