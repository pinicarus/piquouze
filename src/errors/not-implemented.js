"use strict";

const _name = Symbol("name");

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
    this[_name] = name;
  }

  /**
   * The name of the missing code.
   *
   * @returns {String} The name of the missing code.
   */
  get name() {
    return this[_name];
  }
};

module.exports = NotImplementedError;
