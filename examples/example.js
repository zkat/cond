var cond = require("../src");

var availableFlavors = ["chocolate", "vanilla", "mint chocolate chip"];
function getIceCream(flavor) {
    if (availableFlavors.indexOf(flavor) !== -1) {
        return flavor + " ice cream ゲットー!";
    } else {
        // Just like throw new Error("something"), but we provide a way
        // the user can recover from it.
        return cond.error("Sorry, that flavor is not available", [
            "different-flavor", "Try a different flavor", getIceCream
        ], [
            "add-flavor", "Add this flavor to available ones and retry", function() {
                availableFlavors.push(flavor);
                return getIceCream(flavor);
            }
        ]);
    }
}

// NOTE: This will only work if you have access to an interactive JS debugger
//       configured to break on the debugger statement. If that's not the case,
//       the script will fail here.
console.log(getIceCream("coffee"));
console.log("I really like this flavor!");

// In the console, do:

// > showRecoveries();
// > recover(0, "chocolate");

// You can also access recoveries programmatically:
console.log(cond.handlerBind(function() {
    return getIceCream("bubblegum");
}, [Error, function(e) { return cond.recover("add-flavor"); }]));
console.log("new available ice cream flavors: ", availableFlavors);
