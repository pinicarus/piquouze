"use strict";

const PerContextPolicy = require("./per-context");

const cache = new WeakMap();

/**
 * A caching policy that will cache values for each container.
 */
const PerContainerPolicy = class extends PerContextPolicy {
  /**
   * Constructs a new caching policy on context containers.
   */
  constructor() {
    super(cache, "container");
  }
};

module.exports = PerContainerPolicy;
