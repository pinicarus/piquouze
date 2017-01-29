"use strict";

const path = require("path");

const requireSrc = function (...args) {
	const file = path.resolve.apply(undefined, [__dirname, "src"].concat(args));

	return require(file);
};

global.requireSrc = requireSrc;
