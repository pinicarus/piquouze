"use strict";

const Injector = require("./injector");
const PerInjectionPolicy = require("./policies/per-injection");
const Policy = require("./policy");
const mark = require("./mark");
const params = require("./params");

const defaultPolicy = new PerInjectionPolicy();

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
    const args = params(arguments, [
      {type: Container, default: {[_container]: null}},
    ], true);

    this[_container] = Object.setPrototypeOf({}, args[0][_container]);
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
   * @param {String=}  name    - The name of the factory.
   * @param {Function} functor - The actual factory.
   * @param {Policy=}  policy  - The caching policy.
   *
   * @throws {TypeError} Whenever the functor does not inherit from Function.
   * @throws {TypeError} Whenever the policy does not inherit from Policy.
   * @throws {TypeError} Whenever no name was given and none could be inferred.
   */
  registerFactory() {
    const args = params(arguments, [
      {type: String, default: null},
      {type: Function},
      {type: Policy,default: defaultPolicy},
    ], true);

    let   name    = args[0];
    const functor = args[1];
    const policy  = args[2];

    mark(functor);
    name = name || functor.$name;
    if (!name) {
      throw new TypeError("Missing functor name");
    }
    this[_container][name] = {
      value:  functor,
      policy: policy,
    };
  }

  /**
   * Inject a functor with registered values.
   *
   * @param {Function} functor - The functor to inject.
   *
   * @returns {Function}  The injected functor.
   * @throws  {TypeError} Whenever the functor does not inherit from Function.
   */
  inject(functor) {
    const args = params(arguments, [
      {type: Function},
    ], true);

    return new Injector().inject(this[_container], args[0]);
  }
};

module.exports = Container;
