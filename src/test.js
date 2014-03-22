"use strict";

var assert = require("assert"),
    cond = require("./index");

describe("cond", function() {
  describe("signal()", function() {
    it("signals a condition");
    it("accepts one or more recoveries as extra arguments");
    it("throws the condition if it wasn't handled");
    it("returns the recovery value if a recovery is invoked");
  });
  describe("error()", function() {
    it("signals a condition if given an object");
    it("signals an Error if given a string, using it as the message");
    it("accepts one or more recoveries as extra arguments");
    it("returns the recovery value if a recovery is invoked");
  });
  describe("cerror()", function() {
    it("signals a condition if given an object");
    it("signals an Error if given a string, using it as the message");
    it("accepts one or more recoveries as extra arguments");
    it("installs a 'continue' recovery");
    it("returns the recovery value if a recovery is invoked");
  });
  describe("warn()", function() {
    it("signals a condition if given an object");
    it("signals a cond.Warning if given a string, using it as the message");
    it("accepts one or more recoveries as extra arguments");
    it("returns the recovery value if a recovery is invoked");
  });
  describe("handlerBind()", function() {
    it("executes a callback with handlers established");
    it("executes any handlers that match by type");
    it("executes handlers in the order they were given");
    it("can be nested, with handlers ordered in-to-out");
    it("stops executing handlers if one of them does a non-local return");
    it("allows invocation of recoveries from inside handlers");
  });
  describe("handlerCase()", function() {
    it("executes a callback with handlers established");
    it("automatically handles signals using the first matching handler");
    it("can be nested, with handlers ordered in-to-out");
    it("cannot be used to invoke recoveries");
  });
  describe("recoverable()", function() {
    it("establishes a recovery");
    it("returns the value of the callback if it succeeds");
    it("returns the value of an invoked recovery if it fails");
  });
  describe("recover()", function() {
    it("invokes a recovery");
  });
  describe("findRecovery()", function() {
    it("finds a recovery by string name");
    it("finds a recovery by index");
  });
});
