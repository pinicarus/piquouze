"use strict";

/**
 * Storage for internal properties of NotImplementedError instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * An error representing some not implemented code.
 */
const NotImplementedError = class NotImplementedError extends Error {
	/**
	 * Constructs a new error represending some not implemented code
	 *
	 * @param {String} name - The name of the missing code.
	 */
	constructor(name) {
		super(`${name} not implemented`);
		properties.set(this, {
			name,
		});
	}

	/**
	 * The name of the missing code.
	 *
	 * @returns {String} The name of the missing code.
	 */
	get name() {
		return properties.get(this).name;
	}
};

module.exports = NotImplementedError;
