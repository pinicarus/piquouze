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
    default:
      functor.$kind = "arrow";
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

    describe("with extra parameters", function () {
      it("should inject a function", function () {
        const functor = new Injector().inject(
          container(),
          mark([], {}, function (a) {
            return [a];
          })
        );

        assert(functor instanceof Function);
        assert.deepEqual(functor("x"), ["x"]);
      });

      it("should inject an arrow function", function () {
        const functor = new Injector().inject(
          container(),
          mark([], {}, (a) => [a])
        );

        assert(functor instanceof Function);
        assert.deepEqual(functor("x"), ["x"]);
      });

      it("should inject a class constructor", function () {
        const target  = class {
          constructor(a) {
            this.args = [a];
          }
        };

        const functor = new Injector().inject(
          container(),
          mark([], {}, target)
        );

        assert(functor instanceof Function);

        const instance = functor("x");

        assert(instance instanceof target);
        assert.deepEqual(instance.args, ["x"]);
      }); 
    });
  });

  describe("with 1 parameter", function () {
    const container = () => ({
      a: {value: 1},
    });

    it("should inject a function ", function () {
      const functor = new Injector().inject(container(), function (a) {
        return [a];
      });

      assert(functor instanceof Function);
      assert.deepEqual(functor(), [1]);
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

    describe("with extra parameters", function () {
      it("should inject a function ", function () {
        const functor = new Injector().inject(
            container(),
            mark(["a"], {}, function (a, b) {
              return [a, b];
            })
        );

        assert(functor instanceof Function);
        assert.deepEqual(functor("x"), [1, "x"]);
      });

      it("should inject an arrow function", function () {
        const functor = new Injector().inject(
          container(),
          mark(["a"], {}, (a, b) => [a, b])
        );

        assert(functor instanceof Function);
        assert.deepEqual(functor("x"), [1, "x"]);
      });

      it("should inject a class constructor", function () {
        const target  = class {
          constructor(a, b) {
            this.args = [a, b];
          }
        };

        const functor = new Injector().inject(
          container(),
          mark(["a"], {}, target)
        );

        assert(functor instanceof Function);

        const instance = functor("x");

        assert(instance instanceof target);
        assert.deepEqual(instance.args, [1, "x"]);
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

    describe("with extra parameters", function () {
      it("should inject a function", function () {
        const functor = new Injector().inject(
          container(),
          mark(["a", "b"], {}, function (a, b, c) {
            return [a, b, c];
          })
        );

        assert(functor instanceof Function);
        assert.deepEqual(functor("x"), [1, 2, "x"]);
      });

      it("should inject an arrow function", function () {
        const functor = new Injector().inject(
          container(),
          mark(["a", "b"], {}, (a, b, c) => [a, b, c])
        );

        assert(functor instanceof Function);
        assert.deepEqual(functor("x"), [1, 2, "x"]);
      });

      it("should inject a class constructor", function () {
        const target  = class {
          constructor(a, b, c) {
            this.args = [a, b, c];
          }
        };

        const functor = new Injector().inject(
          container(),
          mark(["a", "b"], {}, target)
        );

        assert(functor instanceof Function);

        const instance = functor("x");

        assert(instance instanceof target);
        assert.deepEqual(instance.args, [1, 2, "x"]);
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
    assert.throws(() => new Injector().inject({}, (a) => [a]),
                  MissingDependencyError);
  });

  it("should inject factory dependency", function () {
    const container = {
      a: {value: 1},
      b: {
        value:  mark(["a"], {}, (a) => [a]),
        policy: new NeverPolicy(),
      },
    };

    const functor = new Injector().inject(container, (b) => b);

    assert.deepEqual(functor(), [1]);
  });
});
