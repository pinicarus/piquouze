"use strict";

const Scanner = require("./scanner");

const makeScanner = function (functor) {
  let scanner = null;

  return () => {
    if (!scanner) {
      scanner = new Scanner(functor);
    }
    return scanner;
  };
};

/**
 * Marks a functor with the names of its injectable properties.
 * @private
 *
 * @param {Function} functor - The functor to mark for injection.
 *
 * @throws {ScanError} Whenever scanning of the functor failed.
 */
const mark = function mark(functor) {
  const scanner = makeScanner(functor);

  if (typeof functor.$kind !== "string") {
    functor.$kind = scanner().getKind();
  }
  if (typeof functor.$name !== "string") {
    const name = scanner().getName();

    if (name) {
      functor.$name = name;
    }
  }
  if (!(functor.$inject instanceof Array)) {
    functor.$inject = scanner().getParams();
  }
  if (!(functor.$defaults instanceof Object)) {
    functor.$defaults = scanner().getDefaults();
  }
};

module.exports = mark;
