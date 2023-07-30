let lowMem = "util/lowMemStartup.js";
let fullMem = "util/fullStartup.js";

/** @param {NS} ns */
export async function main(ns) {
  // If startup already running, don't start another
  if (ns.scriptRunning(fullMem,"home") || ns.scriptRunning(lowMem,"home")) { return; }
  // otherwise, fullMem if reasonable, lowMem if not
  else if (ns.getServerMaxRam("home") > 2*ns.getScriptRam(fullMem)) {
    ns.run(fullMem);
    ns.tail(fullMem);
  } else {
    ns.run(lowMem);
    ns.tail(lowMem);
  }
}