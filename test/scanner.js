"use strict";

const assert = require("assert");

const ScanError = requireSrc("errors", "scan");
const Scanner   = requireSrc("scanner");

describe("Scanner", function () {
	const _ = class {};

	it("should conform", function () {
		assert(Scanner instanceof Function);
	});

	describe("with 0 parameters", function () {
		it("should scan anonymous arrow function", function () {
			const scanner = new Scanner(() => {});

			assert.equal(scanner.getKind(), "arrow");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous function", function () {
			const scanner = new Scanner(function () {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named function", function () {
			const scanner = new Scanner(function f() {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous class", function () {
			const scanner = new Scanner(class {constructor() {}});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous empty class", function () {
			const scanner = new Scanner(class {});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous extending class", function () {
			const scanner = new Scanner(class extends _ {
				constructor() {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named class", function () {
			const scanner = new Scanner(class C {constructor() {}});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named empty class", function () {
			const scanner = new Scanner(class C {});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named extending class", function () {
			const scanner = new Scanner(class C extends _ {
				constructor() {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan class not starting with constructor", function () {
			const scanner = new Scanner(class {
				foo() {}
				constructor() {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan class method", function () {
			const C = class { f() {} };
			const scanner = new Scanner(new C().f);

			assert.equal(scanner.getKind(), "method");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), []);
			assert.deepEqual(scanner.getDefaults(), {});
		});
	});

	describe("with 1 parameter", function () {
		it("should scan anonymous arrow function w/o parenthesis", function () {
			const scanner = new Scanner(a => {});

			assert.equal(scanner.getKind(), "arrow");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous arrow function w/ parenthesis", function () {
			const scanner = new Scanner((a) => {});

			assert.equal(scanner.getKind(), "arrow");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous function", function () {
			const scanner = new Scanner(function (a) {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named function", function () {
			const scanner = new Scanner(function f(a) {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous class", function () {
			const scanner = new Scanner(class {constructor(a) {}});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous extending class", function () {
			const scanner = new Scanner(class extends _ {
				constructor(a) {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named class", function () {
			const scanner = new Scanner(class C {constructor(a) {}});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named extending class", function () {
			const scanner = new Scanner(class C extends _ {
				constructor(a) {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan class not starting with constructor", function () {
			const scanner = new Scanner(class {
				foo() {}

				constructor(a) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should not mistake constructor", function () {
			const scanner = new Scanner(class {
				foo(b) {
					const constructor = (x) => {};

					constructor(b);
				}

				constructor(a) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan class method", function () {
			const C = class { f(a) {} };
			const scanner = new Scanner(new C().f);

			assert.equal(scanner.getKind(), "method");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), ["a"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});
	});

	describe("with 2 parameters", function () {
		it("should scan anonymous arrow function", function () {
			const scanner = new Scanner((a, b) => {});

			assert.equal(scanner.getKind(), "arrow");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous function", function () {
			const scanner = new Scanner(function (a, b) {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named function", function () {
			const scanner = new Scanner(function f(a, b) {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous class", function () {
			const scanner = new Scanner(class {
				constructor(a, b) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous extending class", function () {
			const scanner = new Scanner(class extends _ {
				constructor(a, b) {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named class", function () {
			const scanner = new Scanner(class C {constructor(a, b) {}});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named extending class", function () {
			const scanner = new Scanner(class C extends _ {
				constructor(a, b) {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan class not starting with constructor", function () {
			const scanner = new Scanner(class {
				foo() {}
				constructor(a, b) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should not mistake constructor", function () {
			const scanner = new Scanner(class {
				foo(c, d) {
					const constructor = (x, y) => {};

					constructor(c, d);
				}

				constructor(a, b) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan class method", function () {
			const C = class { f(a, b) {} };
			const scanner = new Scanner(new C().f);

			assert.equal(scanner.getKind(), "method");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});
	});

	describe("with extra parameters", function () {
		it("should scan anonymous arrow function", function () {
			const scanner = new Scanner((a, b, ...args) => {});

			assert.equal(scanner.getKind(), "arrow");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous function", function () {
			const scanner = new Scanner(function (a, b, ...args) {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named function", function () {
			const scanner = new Scanner(function f(a, b, ...args) {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous class", function () {
			const scanner = new Scanner(class {
				constructor(a, b, ...args) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan anonymous extending class", function () {
			const scanner = new Scanner(class extends _ {
				constructor(a, b, ...args) {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named class", function () {
			const scanner = new Scanner(class C {constructor(a, b, ...args) {}});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan named extending class", function () {
			const scanner = new Scanner(class C extends _ {
				constructor(a, b, ...args) {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan class not starting with constructor", function () {
			const scanner = new Scanner(class {
				foo() {}
				constructor(a, b, ...args) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should not mistake constructor", function () {
			const scanner = new Scanner(class {
				foo(c, d, ...args) {
					const constructor = (x, y, ...args) => {};

					constructor(c, d, ...args);
				}

				constructor(a, b, ...args) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});

		it("should scan class method", function () {
			const C = class { f(a, b, ...args) {} };
			const scanner = new Scanner(new C().f);

			assert.equal(scanner.getKind(), "method");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(scanner.getDefaults(), {});
		});
	});

	describe("with default value parameter", function () {
		it("should scan anonymous arrow function", function () {
			const scanner = new Scanner((a, b = 1) => {});

			assert.equal(scanner.getKind(), "arrow");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should scan anonymous function", function () {
			const scanner = new Scanner(function (a, b = 1) {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should scan named function", function () {
			const scanner = new Scanner(function f(a, b = 1) {});

			assert.equal(scanner.getKind(), "function");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should scan anonymous class", function () {
			const scanner = new Scanner(class {
				constructor(a, b = 1) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should scan anonymous extending class", function () {
			const scanner = new Scanner(class extends _ {
				constructor(a, b = 1) {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should scan named class", function () {
			const scanner = new Scanner(class C {constructor(a, b = 1) {}});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should scan named extending class", function () {
			const scanner = new Scanner(class C extends _ {
				constructor(a, b = 1) {
					super();
				}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), "C");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should scan class not starting with constructor", function () {
			const scanner = new Scanner(class {
				foo() {}
				constructor(a, b = 1) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should not mistake constructor", function () {
			const scanner = new Scanner(class {
				foo(c, d = 1) {
					const constructor = (x, y = 1) => {};

					constructor(c, d);
				}

				constructor(a, b = 1) {}
			});

			assert.equal(scanner.getKind(), "class");
			assert.equal(scanner.getName(), null);
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});

		it("should scan class method", function () {
			const C = class { f(a, b = 1) {} };
			const scanner = new Scanner(new C().f);

			assert.equal(scanner.getKind(), "method");
			assert.equal(scanner.getName(), "f");
			assert.deepEqual(scanner.getParams(), ["a", "b"]);
			assert.deepEqual(Object.keys(scanner.getDefaults()), ["b"]);
		});
	});

	it("should fail to scan child class with missing constructor", function () {
		const parent = class {};

		assert.throws(() => new Scanner(class extends parent {}), ScanError);
	});

	it("should fail to scan non-functor", function () {
		assert.throws(() => new Scanner(42), ScanError);
	});
});
