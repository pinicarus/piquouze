"use strict";

const KillSwitch             = require("./kill-switch");
const MissingDependencyError = require("./errors/missing");
const mark                   = require("./mark");

/**
 * A Caching policy context.
 * @typedef Context
 * @private
 *
 * @property {Object} container - The container triggering the injection.
 * @property {Object} injector  - The injector triggering the injection.
 * @property {String} name      - The name of the injected factory.
 */

const injectable = function injectable(dependencies, marking, functor, context) {
	switch (marking.kind) {
		case "arrow":
			return (...extra) => functor(...dependencies.concat(extra));
		case "class":
			return function(...extra) {
				const bound = functor.bind(...[context].concat(dependencies, extra));

				return new bound();
			};
		case "method":
			return function(...extra) {
				return functor.apply(context, dependencies.concat(extra));
			};
		case "function":
			return function(...extra) {
				const instance = context || Object.create(functor.prototype);
				const result = functor.apply(instance, dependencies.concat(extra));

				return result instanceof Object || Object.getOwnPropertyNames(instance).length === 0
					? result
					: instance;
			};
	}
};

/**
 * Storage for internal properties of Injector instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * An injection handler.
 * @private
 */
const Injector = class Injector {
	/**
	 * Constructs a new injector.
	 */
	constructor() {
		properties.set(this, {
			killSwitch: new KillSwitch(),
			resolved:   {},
		});
	}

	/**
	 * Injects a functor based on dependencies from a container.
	 *
	 * @param {Object}   container - A dependencies container.
	 * @param {Function} functor   - The functor to inject.
	 * @param {*}        [context] - The context to bind the injected functor to.
	 *
	 * @returns {Function}               The injected functor.
	 * @throws  {MissingDependencyError} Whenever a dependency is not resolvable.
	 */
	inject(container, functor, context) {
		const {killSwitch, resolved} = properties.get(this);
		const marking                = mark(functor);

		const dependencies = marking.inject.map((name) => {
			if (!Object.hasOwnProperty.call(resolved,name)) {
				if (!(name in container)) {
					if (!(name in marking.defaults)) {
						throw new MissingDependencyError(name);
					}

					let dependency = marking.defaults[name];

					if (dependency instanceof Function) {
						killSwitch.enter(name);
						dependency = this.inject(container, dependency)();
						killSwitch.exit();
					}
					resolved[name] = dependency;
				} else {
					const descriptor = container[name];
					const value      = descriptor.value;

					if (!(value instanceof Object) || !descriptor.marking) {
						resolved[name] = value;
					} else {
						killSwitch.enter(name);
						const factory = this.inject(container, value);
						killSwitch.exit();

						Object.defineProperty(resolved, name, {
							enumerable:   true,
							configurable: false,
							get:          () => descriptor.policy.getValue({
								container,
								injector: this,
								name,
							}, factory),
						});
					}
				}
			}
			return resolved[name];
		});

		return injectable(dependencies, marking, functor, context);
	}
};

module.exports = Injector;
