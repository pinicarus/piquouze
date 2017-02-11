"use strict";

/**
 * Storage for internal properties of MissingDependencyError instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * An error representing a missing dependency.
 */
const MissingDependencyError = class MissingDependencyError extends Error {
	/**
	 * Constructs a new error representing a missing dependency.
	 *
	 * @param {String} name - The name of the missing dependency.
	 */
	constructor(name) {
		super(`Missing dependency: ${name}`);
		properties.set(this, {
			name,
		});
	}

	/**
	 * The name of the missing dependency.
	 *
	 * @returns {String} The name of the missing dependency.
	 */
	get name() {
		return properties.get(this).name;
	}
};

module.exports = MissingDependencyError;
