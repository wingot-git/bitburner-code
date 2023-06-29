// HacknetDaemon.js
// Automates purchasing and upgrading hacknet nodes to maximum
//
// Args:
// 1: number of Servers (default: 9)
//

/** @param {NS} ns */
export async function main(ns) {
    let numberOfServers = ns.args[0];
    if (!Number.isInteger(numberOfServers)) {
        ns.tprint("Arg 0 expected to be number of servers to start. Defaulting to 9.");
        numberOfServers = 9;
    }

    
}