"use strict";

const types = {
  "undefined": undefined,
  "boolean":   Boolean,
  "function":  Function,
  "number":    Number,
  "string":    String,
  "symbol":    Symbol,
};

/**
 * Parameter type filtering definition.
 * @typedef Typedef
 * @private
 *
 * @property {*} type    - The type to match parameters against.
 * @property {*} default - The default value for optional parameters.
 */

/**
 * Filters optional and required parameters.
 * Missing optional parameters will be replaced by `undefined'.
 * @private
 *
 * @param {Array}     args     - The values to filter.
 * @param {Typedef[]} typedefs - The type definitions to filter with.
 * @param {Boolean}   strict   - Whether all values have to be filtered.
 *
 * @returns {Array}     The filtered values.
 * @throws  {TypeError} Whenever a required parameter is missing.
 * @throws  {TypeError} Whenever a required parameter has the wrong type.
 * @throws  {TypeError} Whenever there are pending values with strict filter.
 */
const params = function (args, typedefs, strict) {
  const pending = Array.from(args);
  const values  = typedefs.map((typedef) => {
    const required = !typedef.hasOwnProperty("default");

    if (pending.length === 0) {
      if (required) {
        throw new TypeError("Missing parameter");
      }
      return typedef.default;
    }

    const value    = pending[0];
    const expected = typedef.type;
    const actual   = value === null ? null : types[typeof value];

    if (actual === expected || value instanceof expected) {
      return pending.shift();
    }
    if (required) {
      throw new TypeError("WrongType");
    }
    return typedef.default;
  });

  const length = pending.length;
  if (strict && length > 0) {
    throw new TypeError(`${length} extra parameters`);
  }

  return values.concat(pending);
};

module.exports = params;
