"use strict";

const path = require("path");

const requireSrc = function () {
  const args = Array.prototype.slice.call(arguments, 0);
  const file = path.resolve.apply(undefined, [__dirname, "src"].concat(args));

  return require(file);
};

global.requireSrc = requireSrc;
