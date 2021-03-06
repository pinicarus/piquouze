"use strict";

const assert = require("assert");

const Injector               = requireSrc("injector");
const MissingDependencyError = requireSrc("errors", "missing");
const NeverPolicy            = requireSrc("policies", "never");

describe("Injector", function () {
	const mark = (inject, defaults, functor) => {
		const text = functor.toString();

		switch (true) {
			case text.startsWith("class"):
				functor.$kind = "class";
				break;
			case text.startsWith("function"):
				functor.$kind = "function";
				break;
			case text.startsWith("("):
				functor.$kind = "arrow";
				break;
			default:
				functor.$kind = "method";
				break;
		}
		functor.$inject   = inject;
		functor.$defaults = defaults;
		return functor;
	};

	it("should conform", function () {
		assert(Injector instanceof Function);
	});

	describe("with 0 parameters", function () {
		const container = () => ({});

		it("should inject a function", function () {
			const functor = new Injector().inject(container(), function () {
				return [];
			});

			assert(functor instanceof Function);
			assert.deepEqual(functor(), []);
		});

		it("should inject a generator", function () {
			const functor = new Injector().inject(container(), function* () {
				const a = yield 1;
				const b = yield 2;
				yield [a, b];
			});

			assert(functor instanceof Function);

			const generator = functor();

			assert.equal(generator.next().value, 1);
			assert.equal(generator.next(3).value, 2);
			assert.deepEqual(generator.next(4).value, [3, 4]);
			assert.equal(generator.next().value, undefined);
			assert.equal(generator.next().value, undefined);
		});

		it("should inject an arrow function", function () {
			const functor = new Injector().inject(container(), () => []);

			assert(functor instanceof Function);
			assert.deepEqual(functor(), []);
		});

		it("should inject a class constructor", function () {
			const target  = class {
				constructor() {}
			};

			const functor = new Injector().inject(container(), target);

			assert(functor instanceof Function);

			const instance = functor();

			assert(instance instanceof target);
		});

		it("should inject a class method", function () {
			const target = class {
				foo() {
					return [this];
				}

				bar() {}
			};
			const instance = new target();

			let functor = new Injector().inject(container(), instance.foo, instance);
			assert(functor instanceof Function);

			let result = functor();
			assert.equal(result.length, 1);
			assert(result[0] instanceof target);

			functor = new Injector().inject(container(), instance.bar, instance);
			assert(functor instanceof Function);

			result = functor();
			assert.equal(result, undefined);
		});

		it("should inject a class generator method", function () {
			const target = class {
				*foo() {
					const a = yield 1;
					const b = yield 2;
					yield [this, a, b];
				}
			};
			const instance = new target();

			const functor = new Injector().inject(container(), instance.foo, instance);

			assert(functor instanceof Function);

			const generator = functor();

			assert.equal(generator.next().value, 1);
			assert.equal(generator.next(3).value, 2);

			const result = generator.next(4).value;

			assert(result.length === 3);
			assert(result[0] instanceof target);
			assert.equal(result[1], 3);
			assert.equal(result[2], 4);

			assert.equal(generator.next().value, undefined);
			assert.equal(generator.next().value, undefined);
		});

		describe("with extra parameters", function () {
			it("should inject a function", function () {
				const functor = new Injector().inject(container(), function (...a) {
					return a;
				});

				assert(functor instanceof Function);
				assert.deepEqual(functor("x"), ["x"]);
			});

			it("should inject a generator", function () {
				const functor = new Injector().inject(container(), function* (...a) {
					const b = yield 1;
					const c = yield 2;
					yield a.concat(b, c);
				});

				assert(functor instanceof Function);

				const generator = functor("x");

				assert.equal(generator.next().value, 1);
				assert.equal(generator.next("y").value, 2);
				assert.deepEqual(generator.next("z").value, ["x", "y", "z"]);
				assert.equal(generator.next("t").value, undefined);
				assert.equal(generator.next("t").value, undefined);
			});

			it("should inject an arrow function", function () {
				const functor = new Injector().inject(container(), (...a) => a);

				assert(functor instanceof Function);
				assert.deepEqual(functor("x"), ["x"]);
			});

			it("should inject a class constructor", function () {
				const target  = class {
					constructor(...a) {
						this.args = a;
					}
				};

				const functor = new Injector().inject(container(), target);

				assert(functor instanceof Function);

				const instance = functor("x");

				assert(instance instanceof target);
				assert.deepEqual(instance.args, ["x"]);
			});

			it("should inject a class method", function () {
				const target = class {
					foo(...a) {
						return [this].concat(a);
					}

					bar() {}
				};
				const instance = new target();

				let functor = new Injector().inject(container(), instance.foo, instance);
				assert(functor instanceof Function);

				let result = functor("x");
				assert.equal(result.length, 2);
				assert(result[0] instanceof target);
				assert.deepEqual(result.slice(1), ["x"]);

				functor = new Injector().inject(container(), instance.bar, instance);
				assert(functor instanceof Function);

				result = functor();
				assert.equal(result, undefined);
			});

			it("should inject a class generator method", function () {
				const target = class {
					*foo(...a) {
						const b = yield 1;
						const c = yield 2;
						yield [this].concat(a, b, c);
					}
				};
				const instance = new target();

				const functor = new Injector().inject(container(), instance.foo, instance);

				assert(functor instanceof Function);

				const generator = functor("x");

				assert.equal(generator.next().value, 1);
				assert.equal(generator.next("y").value, 2);

				const result = generator.next("z").value;

				assert(result.length === 4);
				assert(result[0] instanceof target);
				assert.deepEqual(result.slice(1), ["x", "y", "z"]);

				assert.equal(generator.next("t").value, undefined);
				assert.equal(generator.next("t").value, undefined);
			});
		});
	});

	describe("with 1 parameter", function () {
		const container = () => ({
			a: {value: 1},
		});

		it("should inject a function", function () {
			const functor = new Injector().inject(container(), function (a) {
				return [a];
			});

			assert(functor instanceof Function);
			assert.deepEqual(functor(), [1]);
		});

		it("should inject a generator", function () {
			const functor = new Injector().inject(container(), function* (a) {
				const b = yield 1;
				yield [a, b];
			});

			assert(functor instanceof Function);

			const generator = functor();

			assert.equal(generator.next().value, 1);
			assert.deepEqual(generator.next(2).value, [1, 2]);
			assert.equal(generator.next(3).value, undefined);
			assert.equal(generator.next(3).value, undefined);
		});

		it("should inject an arrow function", function () {
			const functor = new Injector().inject(container(), (a) => [a]);

			assert(functor instanceof Function);
			assert.deepEqual(functor(), [1]);
		});

		it("should inject a class constructor", function () {
			const target  = class {
				constructor(a) {
					this.args = [a];
				}
			};

			const functor = new Injector().inject(container(), target);

			assert(functor instanceof Function);

			const instance = functor();

			assert(instance instanceof target);
			assert.deepEqual(instance.args, [1]);
		});

		it("should inject a class method", function () {
			const target = class {
				foo(a) {
					return [this, a];
				}

				bar() {}
			};
			const instance = new target();

			let functor = new Injector().inject(container(), instance.foo, instance);
			assert(functor instanceof Function);

			let result = functor();
			assert.equal(result.length, 2);
			assert(result[0] instanceof target);
			assert.deepEqual(result.slice(1), [1]);

			functor = new Injector().inject(container(), instance.bar, instance);
			assert(functor instanceof Function);

			result = functor();
			assert.equal(result, undefined);
		});

		it("should inject a class generator method", function () {
			const target = class {
				*foo(a) {
					const b = yield "x";
					const c = yield "y";
					yield [this, a, b, c];
				}
			};
			const instance = new target();

			const functor = new Injector().inject(container(), instance.foo, instance);

			assert(functor instanceof Function);

			const generator = functor();

			assert.equal(generator.next().value, "x");
			assert.equal(generator.next(2).value, "y");

			const result = generator.next(3).value;

			assert(result.length === 4);
			assert(result[0] instanceof target);
			assert.deepEqual(result.slice(1), [1, 2, 3]);

			assert.equal(generator.next(4).value, undefined);
			assert.equal(generator.next(4).value, undefined);
		});

		describe("with extra parameters", function () {
			it("should inject a function ", function () {
				const functor = new Injector().inject(container(), function (a, ...b) {
					return [a].concat(b);
				});

				assert(functor instanceof Function);
				assert.deepEqual(functor("x"), [1, "x"]);
			});

			it("should inject a generator", function () {
				const functor = new Injector().inject(container(), function* (a, ...b) {
					const c = yield 1;
					yield [a].concat(b, c);
				});

				assert(functor instanceof Function);

				const generator = functor(2);

				assert.equal(generator.next().value, 1);
				assert.deepEqual(generator.next(3).value, [1, 2, 3]);
				assert.equal(generator.next(4).value, undefined);
				assert.equal(generator.next(4).value, undefined);
			});

			it("should inject an arrow function", function () {
				const functor = new Injector().inject(container(), (a, ...b) => [a].concat(b));

				assert(functor instanceof Function);
				assert.deepEqual(functor("x"), [1, "x"]);
			});

			it("should inject a class constructor", function () {
				const target  = class {
					constructor(a, ...b) {
						this.args = [a].concat(b);
					}
				};

				const functor = new Injector().inject(container(), target);

				assert(functor instanceof Function);

				const instance = functor("x");

				assert(instance instanceof target);
				assert.deepEqual(instance.args, [1, "x"]);
			});

			it("should inject a class method", function () {
				const target = class {
					foo(a, ...b) {
						return [this, a].concat(b);
					}

					bar() {}
				};
				const instance = new target();

				let functor = new Injector().inject(container(), instance.foo, instance);
				assert(functor instanceof Function);

				let result = functor("x");
				assert.equal(result.length, 3);
				assert(result[0] instanceof target);
				assert.deepEqual(result.slice(1), [1, "x"]);

				functor = new Injector().inject(container(), instance.bar, instance);
				assert(functor instanceof Function);

				result = functor();
				assert.equal(result, undefined);
			});

			it("should inject a class generator method", function () {
				const target = class {
					*foo(a, ...b) {
						const c = yield 1;
						const d = yield 2;
						yield [this].concat(a, b, c, d);
					}
				};
				const instance = new target();

				const functor = new Injector().inject(container(), instance.foo, instance);

				assert(functor instanceof Function);

				const generator = functor("x");

				assert.equal(generator.next().value, 1);
				assert.equal(generator.next("y").value, 2);

				const result = generator.next("z").value;

				assert(result.length === 5);
				assert(result[0] instanceof target);
				assert.deepEqual(result.slice(1), [1, "x", "y", "z"]);

				assert.equal(generator.next("t").value, undefined);
				assert.equal(generator.next("t").value, undefined);
			});
		});
	});

	describe("with 2 parameters", function () {
		const container = () => ({
			a: {value: 1},
			b: {value: 2},
		});

		it("should inject a function", function () {
			const functor = new Injector().inject(container(), function (a, b) {
				return [a, b];
			});

			assert(functor instanceof Function);
			assert.deepEqual(functor(), [1, 2]);
		});

		it("should inject a generator", function () {
			const functor = new Injector().inject(container(), function* (a, b) {
				const c = yield 1;
				yield [a, b, c];
			});

			assert(functor instanceof Function);

			const generator = functor();

			assert.equal(generator.next().value, 1);
			assert.deepEqual(generator.next(3).value, [1, 2, 3]);
			assert.equal(generator.next(4).value, undefined);
			assert.equal(generator.next(4).value, undefined);
		});

		it("should inject an arrow function", function () {
			const functor = new Injector().inject(container(), (a, b) => [a, b]);

			assert(functor instanceof Function);
			assert.deepEqual(functor(), [1, 2]);
		});

		it("should inject a class constructor", function () {
			const target  = class {
				constructor(a, b) {
					this.args = [a, b];
				}
			};

			const functor = new Injector().inject(container(), target);

			assert(functor instanceof Function);

			const instance = functor();

			assert(instance instanceof target);
			assert.deepEqual(instance.args, [1, 2]);
		});

		it("should inject a class method", function () {
			const target = class {
				foo(a, b) {
					return [this, a, b];
				}

				bar() {}
			};
			const instance = new target();

			let functor = new Injector().inject(container(), instance.foo, instance);
			assert(functor instanceof Function);

			let result = functor();
			assert.equal(result.length, 3);
			assert(result[0] instanceof target);
			assert.deepEqual(result.slice(1), [1, 2]);

			functor = new Injector().inject(container(), instance.bar, instance);
			assert(functor instanceof Function);

			result = functor();
			assert.equal(result, undefined);
		});

		it("should inject a class generator method", function () {
			const target = class {
				*foo(a, b) {
					const c = yield "x";
					const d = yield "y";
					yield [this, a, b, c, d];
				}
			};
			const instance = new target();

			const functor = new Injector().inject(container(), instance.foo, instance);

			assert(functor instanceof Function);

			const generator = functor();

			assert.equal(generator.next().value, "x");
			assert.equal(generator.next(3).value, "y");

			const result = generator.next(4).value;

			assert(result.length === 5);
			assert(result[0] instanceof target);
			assert.deepEqual(result.slice(1), [1, 2, 3, 4]);

			assert.equal(generator.next(5).value, undefined);
			assert.equal(generator.next(5).value, undefined);
		});

		describe("with extra parameters", function () {
			it("should inject a function", function () {
				const functor = new Injector().inject(container(), function (a, b, ...c) {
					return [a, b].concat(c);
				});

				assert(functor instanceof Function);
				assert.deepEqual(functor("x"), [1, 2, "x"]);
			});

			it("should inject a generator", function () {
				const functor = new Injector().inject(container(), function* (a, b, ...c) {
					const d = yield 1;
					yield [a, b].concat(c, d);
				});

				assert(functor instanceof Function);

				const generator = functor(3);

				assert.equal(generator.next().value, 1);
				assert.deepEqual(generator.next(4).value, [1, 2, 3, 4]);
				assert.equal(generator.next(5).value, undefined);
				assert.equal(generator.next(5).value, undefined);
			});

			it("should inject an arrow function", function () {
				const functor = new Injector().inject(container(), (a, b, ...c) => [a, b].concat(c));

				assert(functor instanceof Function);
				assert.deepEqual(functor("x"), [1, 2, "x"]);
			});

			it("should inject a class constructor", function () {
				const target  = class {
					constructor(a, b, ...c) {
						this.args = [a, b].concat(c);
					}
				};

				const functor = new Injector().inject(container(), target);

				assert(functor instanceof Function);

				const instance = functor("x");

				assert(instance instanceof target);
				assert.deepEqual(instance.args, [1, 2, "x"]);
			});

			it("should inject a class method", function () {
				const target = class {
					foo(a, b, ...c) {
						return [this, a, b].concat(c);
					}

					bar() {}
				};
				const instance = new target();

				let functor = new Injector().inject(container(), instance.foo, instance);
				assert(functor instanceof Function);

				let result = functor("x");
				assert.equal(result.length, 4);
				assert(result[0] instanceof target);
				assert.deepEqual(result.slice(1), [1, 2, "x"]);

				functor = new Injector().inject(container(), instance.bar, instance);
				assert(functor instanceof Function);

				result = functor();
				assert.equal(result, undefined);
			});

			it("should inject a class generator method", function () {
				const target = class {
					*foo(a, b, ...c) {
						const d = yield 1;
						const e = yield 2;
						yield [this].concat(a, b, c, d, e);
					}
				};
				const instance = new target();

				const functor = new Injector().inject(container(), instance.foo, instance);

				assert(functor instanceof Function);

				const generator = functor("x");

				assert.equal(generator.next().value, 1);
				assert.equal(generator.next("y").value, 2);

				const result = generator.next("z").value;

				assert(result.length === 6);
				assert(result[0] instanceof target);
				assert.deepEqual(result.slice(1), [1, 2, "x", "y", "z"]);

				assert.equal(generator.next("t").value, undefined);
				assert.equal(generator.next("t").value, undefined);
			});
		});
	});

	it("should resolve with default values", function () {
		const container = {
			a: {value: 1},
			c: {value: 3},
		};

		const functor = new Injector().inject(
			container,
			mark(["a", "b", "c", "d"], {
				b: 2,
				d: (a) => a + 4,
			}, (a, b, c, d) => [a, b, c, d])
		);

		const values = functor();

		assert.deepEqual(values, [1, 2, 3, 5]);
	});

	it("should reuse resolved dependencies", function () {
		const container = {
			a: {value: {}},
		};

		const functor = new Injector().inject(
			container,
			mark(["a", "a"], {}, (a, b) => assert(a === b))
		);

		assert.doesNotThrow(functor);
	});

	it("should fail on missing dependency", function () {
		assert.throws(() => new Injector().inject({}, (a) => [a]), MissingDependencyError);
	});

	it("should inject factory dependency", function () {
		const marking = {
			kind:     "arrow",
			inject:   ["a"],
			defaults: {},
		};

		const container = {
			a: {value: 1},
			b: {
				marking: marking,
				value:   mark(marking.inject, marking.defaults, (a) => [a]),
				policy:  new NeverPolicy(),
			},
		};

		const functor = new Injector().inject(container, (b) => b);

		assert.deepEqual(functor(), [1]);
	});
});
