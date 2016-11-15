"use strict";

/**
 * @typedef {Object} Iterable - An iterable object
 * @property {Function} @@iterator - The function returning an iterator over
 * the iterable.
 */

const facies = require("facies");

const Injector = require("./injector");
const PerInjectionPolicy = require("./policies/per-injection");
const Policy = require("./policy");
const mark = require("./mark");

const getEntriesIterator = function (container) {
  const values = Object.keys(container)
    .map((key) => [key, container[key].value]);

  return values[Symbol.iterator]();
};

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
   */
  constructor() {
    this[_container] = {};
  }

  /**
   * Create a new child container.
   *
   * @returns {Container} A new child container.
   */
  createChild() {
    const child = new Container();

    Object.setPrototypeOf(child[_container], this[_container]);
    return child;
  }

  /**
   * Register a value as a first-class item.
   *
   * @param {String} name  - The name of the value.
   * @param {*}      value - The actual value.
   */
  registerValue(name, value) {
    facies.match(arguments, [
      new facies.TypeDefinition(String),
    ], false);

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
    const args = facies.match(arguments, [
      new facies.TypeDefinition(String, null),
      new facies.TypeDefinition(Function),
      new facies.TypeDefinition(Policy, defaultPolicy),
    ], true);

    let   name    = args[0];
    const functor = args[1];
    const policy  = args[2];
    const marking = mark(functor);

    name = name || marking.name;
    if (!name) {
      throw new TypeError("Missing functor name");
    }
    this[_container][name] = {
      marking: marking,
      value:   functor,
      policy:  policy,
    };
  }

  /**
   * Inject a functor with registered values.
   *
   * @param {Function}           functor - The functor to inject.
   * @param {Object<String, *>=} values  - Extra injectable dependencies.
   *
   * @returns {Function}  The injected functor.
   * @throws  {TypeError} Whenever the functor does not inherit from Function.
   */
  inject() {
    const args = facies.match(arguments, [
      new facies.TypeDefinition(Function),
      new facies.TypeDefinition(Object, null),
    ], true);

    let   container = this;
    const functor   = args[0];
    const values    = args[1];

    if (values) {
      container = container.createChild();
      for (const key in values) {
        container.registerValue(key, values[key]);
      }
    }

    return new Injector().inject(container[_container], functor);
  }

  /**
   * Returns an iterable of [key, value] entries registered explicitely on the
   * container.
   *
   * @returns {Iterable} An iterable object over the entries of values
   * explicitely registered on the container.
   */
  getOwnEntries() {
    return {
      [Symbol.iterator]: () => getEntriesIterator(this[_container]),
    };
  }
};

module.exports = Container;
