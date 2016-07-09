"use strict";

const esprima = require("esprima");

const ScanError = require("./errors/scan");

const makeAssert = function makeAssert(functor) {
  return (truthy) => {
    if (!truthy) {
      throw new ScanError(functor);
    }
  };
};

const _kind   = Symbol("kind");
const _name   = Symbol("name");
const _params = Symbol("params");

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
    this[_name] = null;

    switch (node.type) {
    case esprima.Syntax.ArrowFunctionExpression:
      this[_kind] = "arrow";
      node = node.params;
      break;
    case esprima.Syntax.ClassExpression:
      this[_kind] = "class";
      if (node.id) {
        assert(node.id.type === esprima.Syntax.Identifier);
        this[_name] = node.id.name;
      }
      node = node.body;
      assert(node.type === esprima.Syntax.ClassBody);
      node = node.body.find((method) => method.kind === "constructor");
      assert(node);
      node = node.value;
      assert(node.type === esprima.Syntax.FunctionExpression);
      node = node.params;
      break;
    case esprima.Syntax.FunctionExpression:
      this[_kind] = "function";
      if (node.id) {
        assert(node.id.type === esprima.Syntax.Identifier);
        this[_name] = node.id.name;
      }
      node = node.params;
      break;
    default:
      assert(false);
    }

    this[_params] = node
      .filter((param) => param.type === esprima.Syntax.Identifier)
      .map((param) => param.name);
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
};

module.exports = Scanner;
