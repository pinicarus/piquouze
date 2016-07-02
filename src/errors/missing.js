"use strict";

const _name = Symbol("name");

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
    this[_name] = name;
  }

  /**
   * The name of the missing dependency.
   *
   * @returns {String} The name of the missing dependency.
   */
  get name() {
    return this[_name];
  }
};

module.exports = MissingDependencyError;
