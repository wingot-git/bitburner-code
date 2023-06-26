const shareScript = "Cell/share.js";

/** @param {NS} ns */
export async function main(ns) {
    let server = ns.getHostname();
    let availableRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    let threadCost = ns.getScriptRam(shareScript);
    let availableThreadsForScript = Math.floor(availableRAM / threadCost * 0.85);

    ns.exec(shareScript, "home", availableThreadsForScript);
}