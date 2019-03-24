import { run } from "complexity-report";
let content = require("fs").readFileSync("espree.js", "utf-8");
let opt = { logicalor: false, switchcase: false };
let list = [];

run(content, opt).functions.forEach((entry) => {
    var name = (entry.name === '<anonymous>') ? (':' + entry.line) : entry.name;
    list.push({ name: name, value: entry.complexity.cyclomatic });
});

list.sort((x, y) => {
    return y.value - x.value;
});

console.log("Most cyclomatic-complex functions:");
list.slice(0, 6).forEach((entry) => {
    console.log('  ', entry.name, entry.value);
});
