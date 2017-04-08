"use strict";

/**
 * A caching policy that never caches any values.
 * @memberof caching
 */
const NeverPolicy = class {
	/**
	 * Returns a new value from the factory.
	 *
	 * @param {Context}  context - The injection context.
	 * @param {Function} factory - The injected factory.
	 *
	 * @returns {*} A new value constructed from the factory.
	 */
	getValue(context, factory) {
		return factory();
	}
};

module.exports = NeverPolicy;
