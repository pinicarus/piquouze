"use strict";

/**
 * @typedef {Object} Iterable - An iterable object
 *
 * @property {Function} @@iterator - The function returning an iterator over the iterable.
 */

const facies = require("facies");

const Injector = require("./injector");
const PerInjectionPolicy = require("./policies/per-injection");
const Policy = require("./policy");
const mark = require("./mark");

/**
 * Returns an iterator over the entries of a container.
 * @private
 *
 * @param {Object<String, *>} container - The container to get the entries from.
 *
 * @returns {GeneratorFunction} The entries iterator.
 */
const getEntriesIterator = function (container) {
	const values = Object.keys(container).map((key) => [
		key,
		container[key].value,
		container[key].marking ? "factory" : "value",
	]);

	return values[Symbol.iterator]();
};

/**
 * The factories default caching policy
 * @private
 * @type {Policy}
 */
const defaultPolicy = new PerInjectionPolicy();

/**
 * Storage for internal properties of Container instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * A dependency container.
 * Each dependency is registered with a name and a caching policy.
 * Dependencies can be any first class value except undefined, or a factory function or class.
 */
const Container = class Container {
	/**
	 * Constructs a new container.
	 */
	constructor() {
		properties.set(this, Object.setPrototypeOf({}, null));
	}

	/**
	 * Creates a new child container.
	 *
	 * @returns {Container} A new child container.
	 */
	createChild() {
		const child = new Container();

		Object.setPrototypeOf(properties.get(child), properties.get(this));
		return child;
	}

	/**
	 * Merges multiple container hierarchies.
	 *
	 * @param {...Container} containers - The list of containers to merge.
	 *
	 * @returns {Container} The merged containers.
	 */
	static merge(...containers) {
		facies.match(containers, new Array(containers.length).fill(new facies.TypeDefinition(Container)), true);

		const child = new Container();
		let   next  = properties.get(child);

		for(let values = containers.map((container) => properties.get(container));
			 values.length > 0;
			 values = values.reduce((parents, value) => {
				const parent = Object.getPrototypeOf(value);

				if (parent !== null) {
					parents.push(parent);
				}
				return parents;
			 }, [])) {
			const merged = Object.assign({}, ...values);

			Object.setPrototypeOf(next, merged);
			next = merged;
		}
		Object.setPrototypeOf(next, null);
		return child;
	}

	/**
	 * Registers a value as a first-class item.
	 *
	 * @param {String} name  - The name of the value.
	 * @param {*}      value - The actual value.
	 */
	registerValue(name, value) {
		facies.match(arguments, [new facies.TypeDefinition(String)], false);

		properties.get(this)[name] = {value};
	}

	/**
	 * Registers a factory value.
	 *
	 * @param {String}   [name]   - The name of the factory.
	 * @param {Function} functor  - The actual factory.
	 * @param {Policy}   [policy] - The caching policy.
	 *
	* @throws {TypeError} Whenever the functor does not inherit from Function.
	* @throws {TypeError} Whenever the policy does not inherit from Policy.
	* @throws {TypeError} Whenever no name was given and none could be inferred.
	*/
	registerFactory(name, functor, policy) {
		let [
			_name,
			_functor,
			_policy,
		] = facies.match(arguments, [
			new facies.TypeDefinition(String, null),
			new facies.TypeDefinition(Function),
			new facies.TypeDefinition(Policy, defaultPolicy),
		], true);
		const marking = mark(_functor);

		_name = _name || marking.name;
		if (!_name) {
			throw new TypeError("Missing functor name");
		}
		properties.get(this)[_name] = {
			marking,
			value:  _functor,
			policy: _policy,
		};
	}

	/**
	 * Injects a functor with registered values.
	 *
	 * @param {Function}          functor   - The functor to inject.
	 * @param {Object<String, *>} [values]  - Extra injectable dependencies.
	 *
	 * @returns {Function}  The injected functor.
	 * @throws  {TypeError} Whenever the functor does not inherit from Function.
	 */
	inject(functor, values) {
		const [
			_functor,
			_values,
		] = facies.match(arguments, [
			new facies.TypeDefinition(Function),
			new facies.TypeDefinition(Object, null),
		], true);
		let container = this;

		if (_values) {
			container = container.createChild();
			for (const key in _values) {
				container.registerValue(key, _values[key]);
			}
		}

		return new Injector().inject(properties.get(container), _functor);
	}

	/**
	 * Returns an iterable of [key, value, type] entries registered explicitely on the container.
	 *
	 * @returns {Iterable} An iterable object over the entries of values explicitely registered on the container.
	 */
	getOwnEntries() {
		return {
			[Symbol.iterator]: () => getEntriesIterator(properties.get(this)),
		};
	}

	/**
	 * Returns an iterable of [key, value, type] entries registered explicitely on the container.
	 *
	 * @returns {Iterable} An iterable object over the entries of values registered on the container or any of its
	 * ancestors.
	 */
	getEntries() {
		return {
			[Symbol.iterator]: function* () {
				for(let container = properties.get(this);
					 container !== null;
					 container = Object.getPrototypeOf(container)) {
					yield* getEntriesIterator(container);
				}
			}.bind(this),
		};
	}
};

module.exports = Container;
