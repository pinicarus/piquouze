"use strict";

/**
 * Storage for internal properties of ScanError instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * An error representing a functor scanning error.
 */
const ScanError = class ScanError extends Error {
	/**
	 * Constructs a new error represending a functor scanning error.
	 *
	 * @param {Function} functor - The functor.
	 */
	constructor(functor) {
		super(`Scan error: ${functor}`);
		properties.set(this, {
			functor,
		});
	}

	/**
	 * The functor that couldn't be scanned.
	 *
	 * @returns {Function} The functor.
	 */
	get functor() {
		return properties.get(this).functor;
	}
};

module.exports = ScanError;
