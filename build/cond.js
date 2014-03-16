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
	
	function signal(cond) {
	  if (arguments.length <= 1) {
	    return _signal(cond);
	  } else {
	    return restartCase.apply(
	      this,
	      [function(){return _signal(cond);}].concat([].slice.call(arguments, 1)));
	  }
	}
	
	function _signal(cond) {
	  HANDLERS.forEach(function(handlerEntry) {
	    if (cond instanceof handlerEntry[0]) {
	      handlerEntry[1](cond);
	    }
	  });
	}
	
	function handlerBind(handledBody) {
	  var handlers = [].slice.call(arguments, 1),
	      oldHandlers = HANDLERS;
	  try {
	    HANDLERS = handlers.concat(HANDLERS);
	    return handledBody.call(this);
	  } finally {
	    HANDLERS = oldHandlers;
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
	
	function listRestarts() {
	  // "Deep enough" copy to protect the internal RESTARTS array structure from
	  // user shenanigans.
	  return RESTARTS.map(function(x) {
	    return x.map(function(x) { return x; });
	  });
	}
	
	function restartCase(restartableBody) {
	  var sentinel = {},
	      oldRestarts = RESTARTS,
	      restarts = [].slice.call(arguments, 1).map(function(entry) {
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
	    RESTARTS = restarts.concat(RESTARTS);
	    return restartableBody.call(this);
	  } catch(e) {
	    if (e === sentinel) {
	      return sentinel.callback.apply(this, sentinel.args);
	    } else {
	      throw e;
	    }
	  } finally {
	    RESTARTS = oldRestarts;
	  }
	}
	
	function restart(name) {
	  return _restart(name);
	}
	function _restart(name) {
	  var restart = Array.isArray(name) ? name : findRestart(name),
	      restartArgs = [].slice.call(arguments, 1);
	  restart[restart.length-1].apply(this, restartArgs);
	}
	
	function findRestart(name) {
	  if (typeof name === "string") {
	    for (var i = 0; i < RESTARTS.length; i++) {
	      if (name === RESTARTS[i][0]) {
	        return RESTARTS[i];
	      }
	      return undefined;
	    }
	  } else {
	    return RESTARTS[name];
	  }
	}
	
	/**
	 * Invokes the configured debugger.
	 */
	function debug(condition) {
	  /*****************************************************************/
	  /* Welcome to the */ debugger; /* Read below for instructions!!! */
	  /*                                                               */
	  /* Restarts may be available.                                    */
	  /* Call showRestarts() in the JS console to list them.           */
	  /*                                                               */
	  /* If you pick a restart, it will be invoked after you unpause   */
	  /* the debugger. Otherwise, `condition` will be thrown.          */
	  /*                                                               */
	  /*                Thanks for using CondJS!                       */
	  /*                                                               */
	  /*****************************************************************/
	  
	  var __chosenRestart,
	      __restartArgs;
	  function restart(name) {
	    __chosenRestart = name;
	    __restartArgs = arguments;
	    console.log("You have chosen restart: ", name);
	    console.log("Unpause the debugger to continue.");
	  }
	  function showRestarts() {
	    console.log(
	      (((condition && condition.toString) ? condition.toString() + "\n": "") +
	       "Available restarts: \n" +
	       "\n" +
	       RESTARTS.reduce(function(acc, entry, i) {
	         return acc + formatRestart(entry, i) + "\n";
	       }, "") + "\n" +
	       "To use a restart, use `restart(<name or index>[, arg1[, arg2 ...]])`\n"+
	       "\n" +
	       "Unpause your debugger to continue." +
	       ""));
	  }
	
	  if (__chosenRestart != null) {
	    _restart.apply(this, __restartArgs);
	  } else {
	    throw condition;
	  }
	}
	
	function formatRestart(entry, i) {
	  var name = entry[0],
	      description = (typeof entry[1] === "string" && entry[1].length) ?
	        ": "+entry[1] :
	        "";
	  return "["+i+"] "+entry[0]+description;
	}
	
	/*
	 * Internals
	 */
	
	var HANDLERS = [[
	  // If we get an error, force falling back into the debugger.
	  Error, debug
	]],
	    RESTARTS = [];
	
	
	module.exports = {
	  signal: signal,
	  handlerBind: handlerBind,
	  handlerCase: handlerCase,
	  restartCase: restartCase,
	  restart: restart,
	  findRestart: findRestart,
	  debug: debug
	};


/***/ }
/******/ ])
})

//# sourceMappingURL=cond.js.map