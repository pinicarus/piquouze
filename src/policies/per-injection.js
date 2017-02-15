"use strict";

const PerContextPolicy = require("./per-context");

const cache = new WeakMap();

/**
 * A caching policy that will cache values for each injector.
 * @memberof caching
 */
const PerInjectionPolicy = class extends PerContextPolicy {
	/**
	 * Constructs a new caching policy on context injectors.
	 */
	constructor() {
		super(cache, "injector");
	}
};

module.exports = PerInjectionPolicy;
