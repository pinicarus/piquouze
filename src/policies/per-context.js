"use strict";

const Policy = require("../policy");

const _cache = Symbol("cache");
const _field = Symbol("field");

/**
 * A caching policy that will cache values for a context field.
 * @private
 */
const PerContextPolicy = class extends Policy {
  /**
   * Constructs a new caching policy on a given context field.
   *
   * @param {WeakMap} cache - The cache to store values in.
   * @param {String}  field - The context field name to cache on.
   */
  constructor(cache, field) {
    super();
    this[_cache] = cache;
    this[_field] = field;
  }

  /**
   * Returns the value cached or created from the factory.
   *
   * @param {Context}  context - The injection context.
   * @param {Function} factory - The injected factory.
   *
   * @returns {*} A value constructed from the factory.
   */
  getValue(context, factory) {
    const field = context[this[_field]];
    let   value = this[_cache].get(field);

    if (!value) {
      value = factory();
      this[_cache].set(field, value);
    }
    return value;
  }
};

module.exports = PerContextPolicy;
