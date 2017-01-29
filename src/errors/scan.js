"use strict";

const _functor = Symbol("functor");

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
		this[_functor] = functor;
	}

	/**
	 * The functor that couldn't be scanned.
	 *
	 * @returns {Function} The functor.
	 */
	get functor() {
		return this[_functor];
	}
};

module.exports = ScanError;
