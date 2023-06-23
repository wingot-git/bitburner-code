// Run HGW Batches on a list of server
// 
// Args:
// 1: target
// 2: array of useable servers
//

const mainHackingScript = "Controller/Brain.js";
const adjunctHackingScripts = ["Cell/share.js", "Cell/hack.js", "Cell/grow.js", "Cell/weaken.js"];

/** @param {NS} ns */
function runHGWBatch (ns) {
    
}

/** @param {NS} ns */
export async function main(ns) {
    let target = ns.args[0];

    /** @type {any[]} */
    let servers = JSON.parse(ns.args[1]);
}