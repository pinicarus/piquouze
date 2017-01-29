"use strict";

const NotImplementedError = require("./errors/not-implemented");

/**
 * Parent class for all caching policies.
 * Children classes must re-implement the `getValue' method.
 */
const Policy = class Policy {
	/**
	 * Returns a (possibly cached) value from the factory.
	 * @abstract
	 *
	 * @param {Context}  context - The injection context.
	 * @param {Function} factory - The injected factory.
	 *
	 * @throws {NotImplementedError} The method must be overridden.
	 */
	getValue(context, factory) {
		throw new NotImplementedError("getValue");
	}
};

module.exports = Policy;
