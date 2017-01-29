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

const injectable = function injectable(dependencies, marking, functor) {
	// A function is returned so that it can be rebound afterwards.
	return function (...extra) {
		const args = dependencies.concat(extra);

		switch (marking.kind) {
			case "arrow":
				return functor.apply(undefined, args);
			case "class": {
				const bound = functor.bind(...[undefined].concat(args));

				return new bound();
			}
		}

		const instance = this || Object.create(functor.prototype);
		const result   = functor.apply(instance, args);

		return result instanceof Object || Object.getOwnPropertyNames(instance).length === 0
			? result
			: instance;
	};
};

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
		const marking = mark(functor);

		const dependencies = marking.inject.map((name) => {
			if (!this[_resolved].hasOwnProperty(name)) {
				if (!(name in container)) {
					if (!(name in marking.defaults)) {
						throw new MissingDependencyError(name);
					}

					let dependency = marking.defaults[name];

					if (dependency instanceof Function) {
						this[_killSwitch].enter(name);
						dependency = this.inject(container, dependency)();
						this[_killSwitch].exit();
					}
					this[_resolved][name] = dependency;
				} else {
					const descriptor = container[name];
					const value      = descriptor.value;

					if (!(value instanceof Object) || !descriptor.marking) {
						this[_resolved][name] = value;
					} else {
						this[_killSwitch].enter(name);
						const factory = this.inject(container, value);
						this[_killSwitch].exit();

						const context = {
							container,
							injector: this,
							name,
						};

						Object.defineProperty(this[_resolved], name, {
							enumerable:   true,
							configurable: false,
							get:          () => descriptor.policy.getValue(context, factory),
						});
					}
				}
			}
			return this[_resolved][name];
		});

		return injectable(dependencies, marking, functor);
	}
};

module.exports = Injector;
