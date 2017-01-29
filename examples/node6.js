"use strict";

const assert = require("assert");

const piquouze = require("..");

const container = new piquouze.Container();

container.registerValue("a", 1);
container.registerValue("b", 2);
container.registerValue("c", 3);

container.registerFactory("d", function (a, b) {
	return a * 10 + b;
});

container.registerFactory(function e(c) {
	return c * c;
});

const child = container.createChild();

child.registerValue("b", 20); // Override a dependency.

let target = function (a, b, c, d, e, ...args) {
	return [a, b, c, d, e].concat(args);
};

assert.deepEqual(
	container.inject(target)("foo", true),
	[1, 2, 3, 12, 9, "foo", true]
);

assert.deepEqual(
	child.inject(target)("foo", true),
	[1, 20, 3, 30, 9, "foo", true]
);

target = function (a, x = 13, y = {z: new Array()}, ...args) {
	return [a, x, y].concat(args);
};

assert.deepEqual(
	container.inject(target)("foo", true),
	[1, 13, {z: []}, "foo", true]
);

target = function(a, x, y, ...args) {
	return [a, x, y].concat(args);
};
target.$defaults = {
	x: 42,
	y: (e) => e * 10,
};

assert.deepEqual(
	container.inject(target)("foo", true),
	[1, 42, 90, "foo", true]
);
