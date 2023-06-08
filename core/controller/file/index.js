const safeEval = require("safe-eval");
let fnc = `function AA(str) {
    return str
}`;

let fn = safeEval("(" + fnc + ")");

let fn1 = eval("(" + fnc + ")");

console.log(fn(1111));
console.log(fn1(2222));