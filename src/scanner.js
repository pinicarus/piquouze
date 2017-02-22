"use strict";

const escodegen = require("escodegen");
const esprima   = require("esprima");

const ScanError = require("./errors/scan");

/**
 * Returns an assertion checking function.
 * @private
 *
 * @param {Function} functor - The functor to report error on.
 *
 * @returns {Function} The assertion checking function.
 */
const makeAssert = function makeAssert(functor) {
	return (truthy) => {
		if (!truthy) {
			throw new ScanError(functor);
		}
	};
};

/**
 * Parses a functor representation.
 * @private
 *
 * @param {Function} assert  - The assertion checking function to use for error reporting.
 * @param {Function} functor - The functor to parse.
 *
 * @return {Array} A pair with the next AST node and the functor parsed kind.
 */
const parse = function parse(assert, functor) {
	let node, kind;

	try {
		node = esprima.parse(`_ = ${functor.toString()}`, {
			sourceType: "string",
		});
	} catch (_) {
		node = esprima.parse(`_ = function ${functor.toString()}`, {
			sourceType: "string",
		});
		kind = "method";
	}

	assert(node);
	assert(node.type === esprima.Syntax.Program);
	node = node.body;
	assert(node.length === 1);
	node = node[0];
	assert(node.type === esprima.Syntax.ExpressionStatement);
	node = node.expression;
	assert(node.type === esprima.Syntax.AssignmentExpression);
	node = node.right;
	switch (node.type) {
		case esprima.Syntax.ArrowFunctionExpression:
			kind = "arrow";
			break;
		case esprima.Syntax.ClassExpression:
			kind = "class";
			break;
		case esprima.Syntax.FunctionExpression:
			if (!kind) {
				kind = "function";
			}
			break;
		default:
			assert(false);
	}
	return [node, kind];
};

/**
 * Storage for internal properties of Injector instances
 * @private
 * @type {WeakMap}
 */
const properties = new WeakMap();

/**
 * A functor scanner.
 *
 * Scanning is based on the textual representation of the functor. It can be
 * used on functions (both regular and arrow) and classes (both constructors
 * and methods). Any supported functor can be a generator as well.
 */
const Scanner = class Scanner {
	/**
	 * Constructs a new functor scanner.
	 *
	 * @param {Function} functor - The functor to scan.
	 *
	 * @throws {ScanError} Whenever scanning of the functor fails.
	 */
	constructor(functor) {
		const assert     = makeAssert(functor);
		let [node, kind] = parse(assert, functor);

		const props = {
			kind,
			name:     null,
			params:   [],
			defaults: {},
		};
		properties.set(this, props);

		switch (kind) {
			case "class":
				if (node.id) {
					assert(node.id.type === esprima.Syntax.Identifier);
					props.name = node.id.name;
				}
				node = node.body;
				assert(node.type === esprima.Syntax.ClassBody);
				node = node.body.find((method) => method.kind === "constructor");
				if (!node) {
					// Assume class w/o constructor has an empty one.
					return;
				}
				assert(node);
				node = node.value;
				assert(node.type === esprima.Syntax.FunctionExpression);
				break;
			case "function":
			case "method":
				if (node.id) {
					assert(node.id.type === esprima.Syntax.Identifier);
					props.name = node.id.name;
				}
				break;
		}

		assert(node.params);
		node.params.forEach((param) => {
			switch (param.type) {
				case esprima.Syntax.AssignmentPattern: {
					const name  = param.left.name;
					const value = param.right;

					props.params.push(name);
					props.defaults[name] = new Function(
						`return ${escodegen.generate(value)};`
					);
					break;
				}
				case esprima.Syntax.Identifier: {
					const name  = param.name;

					props.params.push(name);
					break;
				}
			}
		});
	}

	/**
	 * The kind of a functor (class, function or arrow).
	 *
	 * @returns {String} The functor kind.
	 */
	get kind() {
		return properties.get(this).kind;
	}

	/**
	 * The name of a functor (named class or named function) or null (unnamed class, unnamed function or arrow).
	 *
	 * @returns {?String} The functor name.
	 */
	get name() {
		return properties.get(this).name;
	}

	/**
	 * The functor injectable parameter names.
	 *
	 * @returns {String[]} The functor parameter names.
	 */
	get params() {
		return properties.get(this).params;
	}

	/**
	 * The functor parameter default values.
	 *
	 * @returns {Object<String, Function>} The default value constructors.
	 */
	get defaults() {
		return properties.get(this).defaults;
	}
};

module.exports = Scanner;
