"use strict";

/**
 * Storage for internal properties of CycleError instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * An error representing a dependency cycle.
 * @memberof errors
 */
const CycleError = class CycleError extends Error {
	/**
	 * Constructs a new error represending a dependency cycle.
	 *
	 * @param {Array} cycle - The cycling dependencies.
	 */
	constructor(cycle) {
		super(`Circular dependencies: ${cycle}`);
		properties.set(this, {
			cycle: Array.from(cycle),
		});
	}

	/**
	 * The dependencies cycle.
	 *
	 * @returns {Array} The cycling dependencies.
	 */
	get cycle() {
		return Array.from(properties.get(this).cycle);
	}
};

module.exports = CycleError;
