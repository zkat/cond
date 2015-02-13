(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["cond"] = factory();
	else
		root["cond"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	/**
	 * Signals a warning condition. By default, warnings do not trigger the
	 * debugger, but they console.warn the condition.
	 *
	 * @param {string|*} condition - The condition to signal. If `condition` is a
	 *                               string, it will be turned into a Warning and
	 *                               that warning will be signaled.
	 * @param {...Array} recoveries - Recoveries to make available. An invoked
	 *                                recovery will replace the value of the
	 *                                `warn()` call.
	 *
	 * @returns `undefined` or the value of the invoked recovery.
	 */
	function warn(cond) {
	  arguments[0] = typeof cond === "string" ? new Warning(cond) : cond;
	  return signal.apply(this, arguments);
	}
	
	function Warning() {}
	Warning.prototype = new Error;
	Warning.prototype.constructor = Warning;
	
	/**
	 * Signals a continuable error. This function is identical to `error()`, except
	 * it makes a `"continue"` recovery available. Invoking this recovery will allow
	 * execution to continue normally. The recovery can optionally be given a value
	 * that `cerror()` will return.
	 *
	 * @param {string|*} condition - The condition to signal. If `condition` is a
	 *                               string, it will be turned into an Error before
	 *                               being signaled.
	 * @param {...Array} recoveries - Recoveries to make available. An invoked
	 *                                recovery will replace the value of the
	 *                                `cerror()` call.
	 *
	 * @returns The value of the invoked recovery.
	 */
	function cerror() {
	  return error.apply(this, [
	    arguments[0],
	    ["continue",
	     "Return undefined (or a value) and continue normally",
	     function(x){return x;}]
	  ].concat([].slice.call(arguments, 1)));
	}
	
	/**
	 * Signals an error. Optionally accepts one or more recoveries, which may
	 * replace the value of the `error()` call.
	 *
	 * @param {string|*} condition - The condition to signal. If `condition` is a
	 *                               string, it will be turned into an Error before
	 *                               being signaled.
	 * @param {...Array} recoveries - Recoveries to make available. An invoked
	 *                                recovery will replace the value of the
	 *                                `error()` call.
	 *
	 * @returns The value of the invoked recovery.
	 *
	 * @example
	 * cond.error("Kaboom");
	 * cond.error("Something exploded",
	 *            ["gimme-5", "Just returns 5", function() { return 5; }]);
	 * cond.error(new CustomError("Goodbye"));
	 */
	function error(cond) {
	  arguments[0] = typeof cond === "string" ? new Error(cond) : cond;
	  return signal.apply(this, arguments);
	}
	
	/**
	 * Signals a condition. Optionally accepts one or more recoveries, which may
	 * replace the value of the `signal()` call.
	 *
	 * @param {*} condition - The condition to signal.
	 * @param {...Array} recoveries - Recoveries to make available. An invoked
	 *                                recovery will replace the value of the
	 *                                `signal()` call.
	 *
	 * @returns The value of the invoked recovery.
	 *
	 * @example
	 * cond.signal(new InvalidEntry(entry));
	 * cond.signal(new NotANumberError(num),
	 *            ["gimme-5", "Just returns 5", function() { return 5; }]);
	 */
	function signal(cond) {
	  if (arguments.length <= 1) {
	    return _signal(cond);
	  } else {
	    return recoverable.apply(
	      this,
	      [function(){return _signal(cond);}].concat([].slice.call(arguments, 1)));
	  }
	}
	
	function _signal(cond) {
	  var oldClusters = HANDLER_CLUSTERS;
	  try {
	    HANDLER_CLUSTERS.forEach(function(cluster) {
	      HANDLER_CLUSTERS = HANDLER_CLUSTERS.slice(1);
	      _signalCluster(cond, cluster);
	    });
	  } finally {
	    HANDLER_CLUSTERS = oldClusters;
	  }
	}
	
	function _signalCluster(cond, cluster) {
	  cluster.forEach(function(handlerEntry) {
	    if (typeof handlerEntry === "function") {
	      handlerEntry(cond);
	    } else if (typeof cond === "object" &&
	               cond instanceof handlerEntry[0]) {
	      handlerEntry[1](cond);
	    }
	  });
	}
	
	/**
	 * Executes `handledBody` in a dynamic context with a set of given handlers
	 * installed. Handlers can either be arrays of `[Constructor, handler]`, or
	 * simply a lone function. In the array form, the handler will be called
	 * whenever a condition is signaled which is `instanceof` that `Constructor`. In
	 * the cases of a solo function handler, the handler will be unconditionally
	 * executed.
	 *
	 * Note that handlerBind handlers do not automatically catch signals. In order
	 * to handle/catch a signal, the handler callback must perform its own non-local
	 * exit from the execution context. To automatically catch when a handler
	 * matches, use `handlerCase()` instead.
	 *
	 * @param {Function} handledBody - Function to execute in a handled dynamic
	 *                                 context.
	 * @param {...Array|Function} handlers - Handlers to execute on matching
	 *                                       signals. Executed first to last.
	 *
	 * @returns The value of `handledBody`.
	 *
	 * @example
	 * cond.handlerBind(function() {
	 *   cond.error("fail");
	 * }, [Error, console.error],
	 *    [Error, function() { console.log("This one, too"); }]);
	 */
	function handlerBind(handledBody) {
	  var handlers = [].slice.call(arguments, 1),
	      oldInHandler = IN_HANDLER_SCOPE,
	      oldClusters = HANDLER_CLUSTERS;
	  try {
	    HANDLER_CLUSTERS = [handlers].concat(HANDLER_CLUSTERS);
	    IN_HANDLER_SCOPE = true;
	    return handledBody.call(this);
	  } catch(e) {
	    if (!(e instanceof Sentinel)) {
	      _signalCluster(e, handlers);
	    } else if (e instanceof Sentinel && e.fromDebug && !oldInHandler) {
	      throw e.condition;
	    }
	    throw e;
	  } finally {
	    HANDLER_CLUSTERS = oldClusters;
	    IN_HANDLER_SCOPE = oldInHandler;
	  }
	}
	
	/**
	 * Executes `handledBody` in a dynamic execution context with a set of handlers
	 * installed. Handlers passed to `handlerCase` will automatically catch/handle
	 * signals, unlike `handlerBind`.
	 *
	 * @param {Function} handledBody - Function to execute in a handled dynamic
	 *                                 context.
	 * @param {...Array|Function} handlers - Handlers to execute on matching
	 *                                       signals. Checked first to last.
	 *
	 * @returns The value of `handledBody`, or the value of a successful handler.
	 *
	 * @example
	 * cond.handlerCase(function() {
	 *   cond.error("fail");
	 * }, [Error, console.error],
	 *    [Error, function() { console.log("This one won't be called"); }]);
	 */
	function handlerCase(handledBody) {
	  var sentinel = new Sentinel(),
	      handlers = [].slice.call(arguments, 1).map(function(handlerEntry) {
	        var isArrayEntry = Array.isArray(handlerEntry),
	            oldCallback = isArrayEntry ? handlerEntry[1] : handlerEntry;
	        if (isArrayEntry) {
	          return [handlerEntry[0], handlerCallback];
	        } else {
	          return handlerCallback;
	        }
	        function handlerCallback(e) {
	          sentinel.handler = oldCallback;
	          sentinel.error = e;
	          throw sentinel;
	        };
	      });
	  try {
	    return handlerBind.apply(this, [handledBody].concat(handlers));
	  } catch (e) {
	    if (e === sentinel) {
	      return sentinel.handler.call(this, sentinel.error);
	    } else {
	      throw e;
	    }
	  }
	}
	
	function listRecoveries() {
	  // "Deep enough" copy to protect the internal RECOVERIES array structure from
	  // user shenanigans.
	  return RECOVERIES.map(function(x) {
	    return x.map(function(x) { return x; });
	  });
	}
	
	/**
	 * Executes `recoverableBody` as a recoverable block. Specified recoveries are
	 * able to execute in the context of the `recoverable()` call, and any value
	 * they return will be used to replace the value of the `recoverabl()` call.
	 *
	 * Usually, this feature is used by calling the `signal` family of
	 * functions. `recoverable()` is mostly useful when wrapping non-`cond` code to
	 * allow calls at your application level to be recoverable.
	 *
	 * @param {Function} recoverableBody - Function to execute.
	 * @param {...Array} recoveries - Zero or more recoveries to be made available.
	 *
	 * @returns Either the return value of `recoverableBody`, if it succeeds, or the
	 *          value returned by any invoked `recoveries` if it signals.
	 *
	 * @example
	 * function someLibraryFunction() {
	 *   throw new Error("I've never heard of CondJS");
	 * }
	 *
	 * cond.recoverable(function() {
	 *   return someLibraryFunction();
	 * }, ["gimme-5", "Return 5", function() { return 5; }]);
	 */
	function recoverable(recoverableBody) {
	  var sentinel = new Sentinel(),
	      oldRecoveries = RECOVERIES,
	      recoveries = [].slice.call(arguments, 1).map(function(entry) {
	        var name = entry[0],
	            description = typeof entry[1] === "string" ? entry[1] : "",
	            callback = description ? entry[2] : entry[1];
	        return [name, description, function() {
	          sentinel.callback = callback;
	          sentinel.args = arguments;
	          throw sentinel;
	        }];
	      });
	  try {
	    RECOVERIES = recoveries.concat(RECOVERIES);
	    try {
	      return recoverableBody.call(this);
	    } catch(e) {
	      if (!(e instanceof Sentinel)) {
	        return _signal(e);
	      } else {
	        throw e;
	      }
	    }
	  } catch(e) {
	    if (e === sentinel) {
	      return sentinel.callback.apply(this, sentinel.args);
	    } else {
	      throw e;
	    }
	  } finally {
	    RECOVERIES = oldRecoveries;
	  }
	}
	
	/**
	 * Used within a handler, will invoke a recovery by index, name, or even
	 * directly if it was returned by `findRecovery()`
	 *
	 * @param {number|string|Array} - The recovery to invoke.
	 *
	 * @returns Nothing of value
	 *
	 * @example
	 * cond.handlerBind(function() {
	 *   return cerror("I'm making 'continue' available!");
	 * }, [Error, function(e) { cond.recover("continue"); }]);
	 */
	function recover(name) {
	  return _recover.apply(this, arguments);
	}
	
	function _recover(name) {
	  var recovery = Array.isArray(name) ? name : findRecovery(name),
	      recoveryArgs = [].slice.call(arguments, 1),
	      oldThis = this;
	  if (recovery) {
	    return recovery[recovery.length-1].apply(this, recoveryArgs);
	  } else {
	    return error("Recovery not found: "+name, [
	      "try-again", "Call recover() again with a new name", function(x) {
	        return recover.apply(oldThis, recoveryArgs);
	      }
	    ]);
	
	  }
	}
	
	/**
	 * Finds a recovery in the current dynamic context by name or index. The return
	 * value of this function can be passed to `recover()` directly. No assumptions
	 * should be made about the actual structure of the returned object, except that
	 * `undefined` means no such recovery was found.
	 *
	 * @param {number|string} name - The name or index of the recovery.
	 *
	 * @returns {Array|undefined} recovery - The recovery found, or `undefined`.
	 */
	function findRecovery(name) {
	  if (typeof name === "string") {
	    for (var i = 0; i < RECOVERIES.length; i++) {
	      if (name === RECOVERIES[i][0]) {
	        return RECOVERIES[i];
	      }
	    }
	    return undefined;
	  } else {
	    return RECOVERIES[name];
	  }
	}
	
	/**
	 * Invokes the configured debugger.
	 */
	function debug(condition) {
	  /*****************************************************************/
	  /* Welcome to the */ debugger; /* Read below for instructions!!! */
	  /*                                                               */
	  /* Recoveries may be available.                                  */
	  /* Call showRecoveries() in the JS console to list them.         */
	  /*                                                               */
	  /* If you pick a recovery, it will be invoked after you unpause  */
	  /* the debugger. Otherwise, `condition` will be thrown.          */
	  /*                                                               */
	  /*                Thanks for using CondJS!                       */
	  /*                                                               */
	  /*****************************************************************/
	
	  var __chosenRecovery,
	      __recoveryArgs;
	  function recover(name) {
	    var recovery = findRecovery(name);
	    if (recovery) {
	      __chosenRecovery = RECOVERIES.indexOf(recovery);
	      __recoveryArgs = arguments;
	      console.log("Selected recovery: ["+__chosenRecovery+"] "+recovery[0]);
	      console.log("Unpause the debugger to continue.");
	    } else {
	      console.log("Invalid recovery: ", name);
	      console.log("Use showRecoveries() to see a list of available recoveries");
	    }
	  }
	  function showRecoveries() {
	    console.log(
	      (((condition && condition.toString) ? condition.toString() + "\n": "") +
	       "Available recoveries: \n" +
	       "\n" +
	       RECOVERIES.reduce(function(acc, entry, i) {
	         return acc + formatRecovery(entry, i) + "\n";
	       }, "") + "\n" +
	       "To use a recovery: `recover(<name or index>[, arg1[, arg2 ...]])`\n"+
	       "\n" +
	       "Unpause your debugger to continue." +
	       ""));
	  }
	
	  if (__chosenRecovery != null) {
	    _recover.apply(this, __recoveryArgs);
	  } else if (IN_HANDLER_SCOPE) {
	    var sentinel = new Sentinel();
	    sentinel.condition = condition;
	    sentinel.fromDebug = true;
	    throw sentinel;
	  } else {
	    throw condition;
	  }
	}
	
	function formatRecovery(entry, i) {
	  var name = entry[0],
	      description = (typeof entry[1] === "string" && entry[1].length) ?
	        ": "+entry[1] :
	        "";
	  return "["+i+"] "+entry[0]+description;
	}
	
	/*
	 * Internals
	 */
	function Sentinel() {}
	
	var HANDLER_CLUSTERS = [[
	  [Warning, function(w) { console.warn(w); }],
	  // If we get anything else unhandled, force falling back into the debugger.
	  // Unless it's a warning, which we treat special.
	  function(c) {if (c instanceof Warning) { return; } else { debug(c); }}
	]],
	    RECOVERIES = [],
	    IN_HANDLER_SCOPE;
	
	
	module.exports = {
	  signal: signal,
	  error: error,
	  cerror: cerror,
	  warn: warn,
	  Warning: Warning,
	  handlerBind: handlerBind,
	  handlerCase: handlerCase,
	  recoverable: recoverable,
	  recover: recover,
	  findRecovery: findRecovery,
	  debug: debug
	};


/***/ }
/******/ ])
});

//# sourceMappingURL=cond.js.map