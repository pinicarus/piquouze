"use strict";

const CycleError = require("./errors/cycle");

const _seen    = Symbol("seen");
const _circuit = Symbol("circuit");

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
    this[_seen]    = new Map();
    this[_circuit] = [];
  }

  /**
   * Add a new value to the set of inspected values.
   *
   * @param {*} value - A new value to inspect.
   *
   * @throws {CycleError} Whenever a cycle is detected.
   */
  enter(value) {
    this[_circuit].push(value);
    if (this[_seen].has(value)) {
      throw new CycleError(this[_circuit]);
    }
    this[_seen].set(value, true);
  }

  /**
   * Forget about the last added value.
   */
  exit() {
    this[_seen].delete(this[_circuit].pop());
  }
};

module.exports = KillSwitch;
