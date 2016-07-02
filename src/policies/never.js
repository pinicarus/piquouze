"use strict";

const Policy = require("../policy");

/**
 * A caching policy that never caches any values.
 */
const NeverPolicy = class extends Policy {
  /**
   * Returns a new value from the factory.
   *
   * @param {Context}  context - The injection context.
   * @param {Function} factory - The injected factory.
   *
   * @returns {*} A new value constructed from the factory.
   */
  getValue(context, factory) {
    return factory();
  }
};

module.exports = NeverPolicy;