"use strict";

function warn(cond) {
  arguments[0] = typeof cond === "string" ? new Warning(cond) : cond;
  return signal.apply(this, arguments);
}

function Warning() {}
Warning.prototype = new Error;
Warning.prototype.constructor = Warning;

function cerror() {
  return error.apply(this, [
    arguments[0],
    ["continue",
     "Return undefined and continue",
     function(){}]
  ].concat([].slice.call(arguments, 1)));
}

function error(cond) {
  arguments[0] = typeof cond === "string" ? new Error(cond) : cond;
  return signal.apply(this, arguments);
}

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
  } catch (e) {
    signal(e);
    throw e;
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
    return cerror("Recovery not found: "+name, [
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
      return undefined;
    }
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
  /* Recoveries may be available.                                    */
  /* Call showRecoveries() in the JS console to list them.           */
  /*                                                               */
  /* If you pick a recovery, it will be invoked after you unpause   */
  /* the debugger. Otherwise, `condition` will be thrown.          */
  /*                                                               */
  /*                Thanks for using CondJS!                       */
  /*                                                               */
  /*****************************************************************/

  var __chosenRecovery,
      __recoveryArgs;
  function recover(name) {
    __chosenRecovery = name;
    __recoveryArgs = arguments;
    console.log("You have chosen recovery: ", name);
    console.log("Unpause the debugger to continue.");
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

var HANDLERS = [[
  Warning, function(w) { console.warn(w); },
  // If we get an error, force falling back into the debugger.
  Error, debug
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
