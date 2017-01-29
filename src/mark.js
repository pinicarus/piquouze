"use strict";

/**
 * @type {Object} Marking - The result of marking a functor.
 * @private
 * @property {String} kind     - The functor kind.
 * @property {String} name     - The functor name.
 * @property {Array}  inject   - The functor dependencies to inject.
 * @property {Object} defaults - Dependencies default values.
 */

const Scanner = require("./scanner");

/**
 * Returns a constructor to lazy-create a scanner.
 * @private
 *
 * @param {Function} functor - The functor to scan for injection.
 * @returns {Function} A function returning a scanner.
 */
const makeScanner = function makeScanner (functor) {
	let scanner = null;

	return () => {
		if (!scanner) {
			scanner = new Scanner(functor);
		}
		return scanner;
	};
};

const markings = new WeakMap();

/**
 * Marks a functor with the names of its injectable properties.
 * @private
 *
 * @param {Function} functor - The functor to mark for injection.
 *
 * @returns {Marking}  The functor marking result.
 * @throws  {ScanError} Whenever scanning of the functor failed.
 */
const mark = function mark(functor) {
	let marking = markings.get(functor);

	if (!marking) {
		const scanner = makeScanner(functor);

		marking = {
			kind:     typeof functor.$kind === "string" && functor.$kind ? functor.$kind     : scanner().getKind(),
			name:     typeof functor.$name === "string" && functor.$name ? functor.$name     : scanner().getName(),
			inject:   functor.$inject instanceof Array                   ? functor.$inject   : scanner().getParams(),
			defaults: functor.$defaults instanceof Object                ? functor.$defaults : scanner().getDefaults(),
		};
		markings.set(functor, marking);
	}
	return marking;
};

module.exports = mark;
