"use strict";

const Injector = require("./injector");
const PerInjectionPolicy = require("./policies/per-injection");
const Policy = require("./policy");
const mark = require("./mark");

const _container = Symbol("container");

/**
 * A dependency container.
 * Each dependency is registered with a name and a caching policy.
 * Dependencies can be any first class value except undefined, or a factory
 * function or class.
 */
const Container = class Container {
  /**
   * Constructs a new container.
   *
   * @param {Container=} parent - The parent container.
   */
  constructor(parent) {
    const prototype = parent instanceof Container ? parent[_container] : null;

    this[_container] = Object.setPrototypeOf({}, prototype);
  }

  /**
   * Create a new child container.
   *
   * @returns {Container} A new child container.
   */
  createChild() {
    return new Container(this);
  }

  /**
   * Register a value as a first-class item.
   *
   * @param {String} name  - The name of the value.
   * @param {*}      value - The actual value.
   */
  registerValue(name, value) {
    this[_container][name] = {value};
  }

  /**
   * Register a factory value.
   *
   * @param {String}   name    - The name of the factory.
   * @param {Function} functor - The actual factory.
   * @param {Policy=}  policy  - The caching policy.
   *
   * @throws {TypeError} Whenever the policy does not inherit from Policy.
   */
  registerFactory(name, functor, policy) {
    if (policy && !(policy instanceof Policy)) {
      throw new TypeError("policy does not inherit from Policy");
    }

    mark(functor);
    this[_container][name] = {
      value:  functor,
      policy: policy || new PerInjectionPolicy(),
    };
  }

  /**
   * Inject a functor with registered values.
   *
   * @param {Function} functor - The functor to inject.
   *
   * @returns {Function} The injected functor.
   */
  inject(functor) {
    return new Injector().inject(this[_container], functor);
  }
};

module.exports = Container;
