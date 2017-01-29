"use strict";

const _cycle = Symbol("cycle");

/**
 * An error representing a dependency cycle.
 */
const CycleError = class CycleError extends Error {
	/**
	 * Constructs a new error represending a dependency cycle.
	 *
	 * @param {Array} cycle - The cycling dependencies.
	 */
	constructor(cycle) {
		super(`Circular dependencies: ${cycle}`);
		this[_cycle] = Array.from(cycle);
	}

	/**
	 * The dependencies cycle.
	 *
	 * @returns {Array} The cycling dependencies.
	 */
	get cycle() {
		return Array.from(this[_cycle]);
	}
};

module.exports = CycleError;
