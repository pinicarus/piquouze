"use strict";

module.exports = Object.freeze({
  Container: require("./container"),

  caching: Object.freeze({
    Always:       require("./policies/always"),
    PerContainer: require("./policies/per-container"),
    PerInjection: require("./policies/per-injection"),
    Never:        require("./policies/never"),
  }),

  errors: Object.freeze({
    Cycle:             require("./errors/cycle"),
    MissingDependency: require("./errors/missing"),
    NotImplemented:    require("./errors/not-implemented"),
  }),
});
