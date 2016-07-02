"use strict";

const Policy = require("../policy");

let cache = undefined;

/**
 * A caching policy that will cache values forever across all containers.
 */
const AlwaysPolicy = class extends Policy {
  /**
   * Returns the value created from the factory.
   *
   * @param {Context}  context - The injection context.
   * @param {Function} factory - The injected factory.
   *
   * @returns {*} The first value ever constructed from the factory.
   */
  getValue(context, factory) {
    if (cache === undefined) {
      cache = factory();
    }
    return cache;
  }
};

module.exports = AlwaysPolicy;
