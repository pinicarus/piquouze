"use strict";

const esprima = require("esprima");

const ScanError = require("./errors/scan");

const makeAssert = (functor) => (truthy) => {
  if (!truthy) {
    throw new ScanError(functor);
  }
};

const Scanner = class Scanner {
  /**
   * Scans a functor injectable parameters names.
   * @private
   *
   * @param {Function} functor - The functor to scan.
   *
   * @returns {String[]}  The functor parameter names.
   * @throws  {ScanError} Whenever scanning of the functor fails.
   */
  scan(functor) {
    const assert = makeAssert(functor);
    const text   = functor.toString();
    let   node   = esprima.parse(`_ = ${text}`, {sourceType: "module"});

    assert(node);
    assert(node.type === esprima.Syntax.Program);
    node = node.body;
    assert(node.length === 1);
    node = node[0];
    assert(node.type === esprima.Syntax.ExpressionStatement);
    node = node.expression;
    assert(node.type === esprima.Syntax.AssignmentExpression);
    node = node.right;

    switch (true) {
    case text.startsWith("class"):
      assert(node.type === esprima.Syntax.ClassExpression);
      node = node.body;
      assert(node.type === esprima.Syntax.ClassBody);
      node = node.body.find((method) => method.kind === "constructor");
      assert(node);
      node = node.value;
      // fallthrough
    case text.startsWith("function"):
      assert(node.type === esprima.Syntax.FunctionExpression);
      node = node.params;
      break;
    default:
      assert(node.type === esprima.Syntax.ArrowFunctionExpression);
      node = node.params;
      break;
    }
    return node
      .filter((param) => param.type === esprima.Syntax.Identifier)
      .map((param) => param.name);
  }
};

module.exports = Scanner;
