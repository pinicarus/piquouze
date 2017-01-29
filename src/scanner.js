"use strict";

const escodegen = require("escodegen");
const esprima   = require("esprima");

const ScanError = require("./errors/scan");

const makeAssert = function makeAssert(functor) {
	return (truthy) => {
		if (!truthy) {
			throw new ScanError(functor);
		}
	};
};

const _kind     = Symbol("kind");
const _name     = Symbol("name");
const _params   = Symbol("params");
const _defaults = Symbol("defaults");

/**
 * Scans functors.
 * @private
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
		const assert = makeAssert(functor);
		let   node   = esprima.parse(`_ = ${functor.toString()}`, {
			sourceType: "module",
		});

		assert(node);
		assert(node.type === esprima.Syntax.Program);
		node = node.body;
		assert(node.length === 1);
		node = node[0];
		assert(node.type === esprima.Syntax.ExpressionStatement);
		node = node.expression;
		assert(node.type === esprima.Syntax.AssignmentExpression);
		node = node.right;
		this[_name]     = null;
		this[_params]   = [];
		this[_defaults] = {};

		switch (node.type) {
			case esprima.Syntax.ArrowFunctionExpression:
				this[_kind] = "arrow";
				break;
			case esprima.Syntax.ClassExpression: {
				this[_kind] = "class";
				if (node.id) {
					assert(node.id.type === esprima.Syntax.Identifier);
					this[_name] = node.id.name;
				}
				const superClass = node.superClass;
				node = node.body;
				assert(node.type === esprima.Syntax.ClassBody);
				node = node.body.find((method) => method.kind === "constructor");
				if (!superClass && !node) {
					// Assume a base class w/o constructor has an empty one.
					return;
				}
				assert(node);
				node = node.value;
				assert(node.type === esprima.Syntax.FunctionExpression);
				break;
			}
			case esprima.Syntax.FunctionExpression:
				this[_kind] = "function";
				if (node.id) {
					assert(node.id.type === esprima.Syntax.Identifier);
					this[_name] = node.id.name;
				}
				break;
			default:
				assert(false);
		}

		assert(node.params);
		node.params.forEach((param) => {
			switch (param.type) {
				case esprima.Syntax.AssignmentPattern: {
					const name  = param.left.name;
					const value = param.right;

					this[_params].push(name);
					this[_defaults][name] = new Function(
						`return ${escodegen.generate(value)};`
					);
					break;
				}
				case esprima.Syntax.Identifier: {
					const name  = param.name;

					this[_params].push(name);
					break;
				}
			}
		});
	}

	/**
	 * Returns the kind of a functor (class, function or arrow).
	 *
	 * @returns {String} The functor kind.
	 */
	getKind() {
		return this[_kind];
	}

	/**
	 * Returns the name of a functor (named class or named function) or null
	 * (unnamed class, unnamed function or arrow).
	 *
	 * @returns {?String} The functor name.
	 */
	getName() {
		return this[_name];
	}

	/**
	 * Returns the functor injectable parameter names.
	 *
	 * @returns {String[]} The functor parameter names.
	 */
	getParams() {
		return this[_params];
	}

	/**
	 * Returns the functor parameter default values.
	 *
	 * @returns {Object<String, Function>} The default value constructors.
	 */
	getDefaults() {
		return this[_defaults];
	}
};

module.exports = Scanner;
