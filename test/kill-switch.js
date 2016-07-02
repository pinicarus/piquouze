"use strict";

const assert = require("assert");

const KillSwitch = requireSrc("kill-switch");
const CycleError = requireSrc("errors", "cycle");

describe("KillSwitch", function () {
  it("should conform", function () {
    assert(KillSwitch instanceof Function);
  });

  it("should accept single value", function () {
    const killSwitch = new KillSwitch();

    killSwitch.enter("a");
    killSwitch.exit();
    killSwitch.enter("a");
  });

  it("should accept many value", function () {
    const killSwitch = new KillSwitch();

    killSwitch.enter("a");
    killSwitch.enter("b");
    killSwitch.enter("c");
    killSwitch.exit();
    killSwitch.enter("c");
    killSwitch.exit();
    killSwitch.exit();
    killSwitch.enter("b");
    killSwitch.enter("c");
  });

  it("should detect a 1-circuit", function () {
    const killSwitch = new KillSwitch();

    killSwitch.enter("a");
    assert.throws(() => killSwitch.enter("a"));
  });

  it("should detect a 2-circuit", function () {
    const killSwitch = new KillSwitch();

    killSwitch.enter("a");
    killSwitch.enter("b");
    assert.throws(() => killSwitch.enter("a"));
  });

  it("should detect a 3-circuit", function () {
    const killSwitch = new KillSwitch();

    killSwitch.enter("a");
    killSwitch.enter("b");
    killSwitch.enter("c");
    assert.throws(() => killSwitch.enter("a"), CycleError);
  });

  it("should detect a 2-circuit not from root", function () {
    const killSwitch = new KillSwitch();

    killSwitch.enter("a");
    killSwitch.enter("b");
    killSwitch.enter("c");
    assert.throws(() => killSwitch.enter("b"), CycleError);
  });
});
