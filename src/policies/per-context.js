"use strict";

const Policy = require("../policy");

/**
 * Storage for internal properties of PerContextPolicy instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * A caching policy that will cache values for a context field.
 * @private
 * @memberof caching
 */
const PerContextPolicy = class extends Policy {
	/**
	 * Constructs a new caching policy on a given context field.
	 *
	 * @param {WeakMap} cache - The cache to store values in.
	 * @param {String}  field - The context field name to cache on.
	 */
	constructor(cache, field) {
		super();
		properties.set(this, {
			cache,
			field,
		});
	}

	/**
	 * Returns the value cached or created from the factory.
	 *
	 * @param {Context}  context - The injection context.
	 * @param {Function} factory - The injected factory.
	 *
	 * @returns {*} A value constructed from the factory.
	 */
	getValue(context, factory) {
		const props = properties.get(this);
		const field = context[props.field];
		let   cache = props.cache.get(field);

		if (!cache) {
			cache = {};
			props.cache.set(field, cache);
		}

		let value = cache[context.name];

		if (!value) {
			cache[context.name] = value = factory();
		}
		return value;
	}
};

module.exports = PerContextPolicy;
