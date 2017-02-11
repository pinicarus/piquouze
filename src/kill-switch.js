"use strict";

const CycleError = require("./errors/cycle");

/**
 * Storage for internal properties of KillSwitch instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * A circuit detector to avoid cyclical dependencies.
 * @private
 */
const KillSwitch = class KillSwitch {
	/**
	 * Constructs a new cycle kill switch.
	 *
	 * @constructor
	 */
	constructor() {
		properties.set(this, {
			seen:    new Map(),
			circuit: [],
		});
	}

	/**
	 * Add a new value to the set of inspected values.
	 *
	 * @param {*} value - A new value to inspect.
	 *
	 * @throws {CycleError} Whenever a cycle is detected.
	 */
	enter(value) {
		const {seen, circuit} = properties.get(this);

		circuit.push(value);
		if (seen.has(value)) {
			throw new CycleError(circuit);
		}
		seen.set(value, true);
	}

	/**
	 * Forget about the last added value.
	 */
	exit() {
		const {seen, circuit} = properties.get(this);

		seen.delete(circuit.pop());
	}
};

module.exports = KillSwitch;
