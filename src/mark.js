"use strict";

const Scanner = require("./scanner");

/**
 * Marks a functor with the names of its injectable dependencies.
 * @private
 *
 * @param {Function} functor - The functor to mark for injection.
 *
 * @returns {String[]}  The marked names of injectable parameters.
 * @throws  {ScanError} Whenever scanning of the functor failed.
 */
const mark = function mark(functor) {
  let inject = functor.$inject;

  if (!(inject instanceof Array)) {
    const scanner = new Scanner(functor);

    inject = scanner.scan(functor);
    functor.$inject = inject;
  }
  return inject;
};

module.exports = mark;
