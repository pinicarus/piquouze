"use strict";

/**
 * @typedef {Object} Iterable - An iterable object
 * @property {Function} @@iterator - The function returning an iterator over
 * the iterable.
 */

const {
	TypeDefinition,
	match,
} = require("facies");

const Injector = require("./injector");
const PerInjectionPolicy = require("./policies/per-injection");
const Policy = require("./policy");
const mark = require("./mark");

const getEntriesIterator = function (container) {
	const values = Object.keys(container).map((key) => [
		key,
		container[key].value,
		container[key].marking ? "factory" : "value",
	]);

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
		this[_container] = Object.setPrototypeOf({}, null);
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
	 * Merge multiple container hierarchies.
	 *
	 * @param {...Container} containers - The list of containers to merge.
	 *
	 * @returns {Container} The merged containers.
	 */
	static merge(...containers) {
		match(containers, [
			new TypeDefinition(Container, null, containers.length),
		], true);

		const child = new Container();
		let   next  = child[_container];

		for(let values = containers.filter((container) => container !== null).map((container) => container[_container]);
			 values.length > 0;
			 values = values.reduce((parents, value) => {
				const parent = Object.getPrototypeOf(value);

				if (parent !== null) {
					parents.push(parent);
				}
				return parents;
			 }, [])) {
			const merged = Object.assign.apply(undefined, [{}].concat(values));

			Object.setPrototypeOf(next, merged);
			next = merged;
		}
		Object.setPrototypeOf(next, null);
		return child;
	}

	/**
	 * Register a value as a first-class item.
	 *
	 * @param {String} name  - The name of the value.
	 * @param {*}      value - The actual value.
	 */
	registerValue(name, value) {
		match(arguments, [
			new TypeDefinition(String),
		], false);

		this[_container][name] = {value};
	}

	/**
	 * Register a factory value.
	 *
	 * @param {String}   [name]   - The name of the factory.
	 * @param {Function} functor  - The actual factory.
	 * @param {Policy}   [policy] - The caching policy.
	 *
	* @throws {TypeError} Whenever the functor does not inherit from Function.
	* @throws {TypeError} Whenever the policy does not inherit from Policy.
	* @throws {TypeError} Whenever no name was given and none could be inferred.
	*/
	registerFactory() {
		let [name, value, policy] = match(arguments, [
			new TypeDefinition(String, null),
			new TypeDefinition(Function),
			new TypeDefinition(Policy, defaultPolicy),
		], true);
		const marking = mark(value);

		name = name || marking.name;
		if (!name) {
			throw new TypeError("Missing functor name");
		}
		this[_container][name] = {
			marking,
			value,
			policy,
		};
	}

	/**
	 * Inject a functor with registered values.
	 *
	 * @param {Function}          functor   - The functor to inject.
	 * @param {Object<String, *>} [values]  - Extra injectable dependencies.
	 *
	 * @returns {Function}  The injected functor.
	 * @throws  {TypeError} Whenever the functor does not inherit from Function.
	 */
	inject() {
		const [functor, values] = match(arguments, [
			new TypeDefinition(Function),
			new TypeDefinition(Object, null),
		], true);
		let container = this;

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

	/**
	 * Returns an iterable of [key, value] entries registered explicitely on the
	 * container.
	 *
	 * @returns {Iterable} An iterable object over the entries of values
	 * explicitely registered on the container.
	 */
	getEntries() {
		return {
			[Symbol.iterator]: function* () {
				for(let container = this[_container];
					container !== null;
					container = Object.getPrototypeOf(container)) {
					yield* getEntriesIterator(container);
				}
			}.bind(this),
		};
	}
};

module.exports = Container;
