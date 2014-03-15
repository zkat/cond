# CondJS

`cond` is [hosted at Github](http://github.com/zkat/cond). `mona` is a
public domain work, dedicated using
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Feel free to do
whatever you want with it.

# Quickstart

### Install

`$ npm install cond`
or
`$ bower install cond`

### Example

Execute the following in a browser session, with developer tools open, and
follow the instructions:

```javascript

function getIceCream() {
  // Instead of 'throw', use cond.signal()
  cond.signal(new Error("There is no ice cream."));
}

function sayWhatILike() {
  return "I really really like "+cond.restartCase(function() {
    return "mint chocolate chip "+getIceCream();
  }, ["ice-cream-substitute", function(x) {return x;}]);
}

sayWhatILike();

// In the console, do:

// > showRestarts();
// > restart(0, "cake");

```

# Introduction

`cond` is a JavaScript implementation of
[Common Lisp's condition system](http://gigamonkeys.com/book/beyond-exception-handling-conditions-and-restarts.html),
a system for handling errors and other conditions of interest that handles
signals at the call site, before the stack is unwound -- allowing you to repair
or alter what happens at the callsite, and continuing executing as if nothing
had been signaled/thrown.
