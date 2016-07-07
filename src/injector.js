"use strict";

const KillSwitch             = require("./kill-switch");
const MissingDependencyError = require("./errors/missing");
const mark                   = require("./mark");

const _killSwitch = Symbol("killSwitch");
const _resolved   = Symbol("resolved");

/**
 * A Caching policy context.
 * @typedef Context
 * @private
 *
 * @property {Object} container - The container triggering the injection.
 * @property {Object} injector  - The injector triggering the injection.
 * @property {String} name      - The name of the injected factory.
 */

/**
 * An injection handler.
 * @private
 */
const Injector = class Injector {
  /**
   * Constructs a new injector.
   */
  constructor() {
    this[_killSwitch] = new KillSwitch();
    this[_resolved]   = {};
  }

  /**
   * Injects a functor based on dependencies from a container.
   *
   * @param {Object}   container - A dependencies container.
   * @param {Function} functor   - The functor to inject.
   *
   * @returns {Function}               The injected functor.
   * @throws  {MissingDependencyError} Whenever a dependency is not resolvable.
   */
  inject(container, functor) {
    const dependencies = mark(functor).map((name) => {
      let dependency = this[_resolved][name];

      if (dependency !== undefined) {
        return dependency;
      }

      const descriptor = container[name];

      if (descriptor === undefined) {
        throw new MissingDependencyError(name);
      }

      const value = descriptor.value;

      if (!value.$inject) {
        this[_resolved][name] = value;
        return value;
      }

      this[_killSwitch].enter(name);
      const factory = this.inject(container, value);
      this[_killSwitch].exit();

      const policy  = descriptor.policy;
      const context = {
        container: container,
        injector:  this,
        name:      name,
      };

      Object.defineProperty(this[_resolved], name, {
        enumerable:   true,
        configurable: false,
        get:          () => policy.getValue(context, factory),
      });

      return this[_resolved][name];
    });

    return function () {
      const args = dependencies.concat(Array.from(arguments));

      switch (functor.$kind) {
      case "class": {
        const bound = functor.bind.apply(functor, [undefined].concat(args));

        return new bound();
      }
      case "function": {
        const instance = Object.create(functor.prototype);
        const result   = functor.apply(instance, args);

        return result instanceof Object
          || Object.getOwnPropertyNames(instance).length === 0
					? result
					: instance;
      }
      default:
        return functor.apply(undefined, args);
      }
    };
  }
};

module.exports = Injector;
