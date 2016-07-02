"use strict";

const getNames = require("get-parameter-names");

/**
 * Marks a functor with the names of its injectable dependencies.
 * @private
 *
 * @param {Function} functor - The functor to mark for injection.
 *
 * @returns {String[]} The marked names of injectable parameters.
 */
const mark = function mark(functor) {
  let inject = functor.$inject;

  if (!(inject instanceof Array)) {
    inject = getNames(functor).filter((name) => !name.startsWith("..."));
    functor.$inject = inject;
  }
  return inject;
};

module.exports = mark;
