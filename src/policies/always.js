"use strict";

const cache = {};

/**
 * A caching policy that will cache values forever across all containers.
 * @memberof caching
 */
const AlwaysPolicy = class {
	/**
	 * Returns the value created from the factory.
	 *
	 * @param {Context}  context - The injection context.
	 * @param {Function} factory - The injected factory.
	 *
	 * @returns {*} The first value ever constructed from the factory.
	 */
	getValue(context, factory) {
		let value = cache[context.name];

		if (!value) {
			cache[context.name] = value = factory();
		}
		return value;
	}
};

module.exports = AlwaysPolicy;
