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
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
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
	      cluster.forEach(function(handlerEntry) {
	        if (typeof handlerEntry === "function") {
	          handlerEntry(cond);
	        } else if (cond instanceof handlerEntry[0]) {
	          handlerEntry[1](cond);
	        }
	      });
	    });
	  } finally {
	    HANDLER_CLUSTERS = oldClusters;
	  }
	}
	
	function handlerBind(handledBody) {
	  var handlers = [].slice.call(arguments, 1),
	      oldClusters = HANDLER_CLUSTERS;
	  try {
	    HANDLER_CLUSTERS = [handlers].concat(HANDLER_CLUSTERS);
	    return handledBody.call(this);
	  } catch (e) {
	    signal(e);
	    throw e;
	  } finally {
	    HANDLER_CLUSTERS = oldClusters;
	  }
	}
	
	function handlerCase(handledBody) {
	  var sentinel = {},
	      handlers = [].slice.call(arguments, 1).map(function(handlerEntry) {
	        return [handlerEntry[0], function(e) {
	          sentinel.handler = handlerEntry[1];
	          sentinel.error = e;
	          throw sentinel;
	        }];
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
	
	function recoverable(recoverableBody) {
	  var sentinel = {},
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
	    return recoverableBody.call(this);
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
	
	var HANDLER_CLUSTERS = [[
	  [Warning, function(w) { console.warn(w); }],
	  // If we get anything else unhandled, force falling back into the debugger.
	  debug
	]],
	    RECOVERIES = [];
	
	
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
})

//# sourceMappingURL=cond.js.map