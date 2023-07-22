let lowMem = "util/lowMemStartup.js";
let fullMem = "util/fullStartup.js";

/** @param {NS} ns */
export async function main(ns) {
  if (ns.getServerMaxRam("home") > 2*ns.getScriptRam(fullMem)) {
    ns.run(fullMem);
    ns.tail(fullMem);
  } else {
    ns.run(lowMem);
    ns.tail(lowMem);
  }
}