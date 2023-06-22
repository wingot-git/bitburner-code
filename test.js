const mainHackingScript = "Controller/Brain.js";

/** @param {NS} ns */
export async function main(ns) {
  //ns.tprint("Cost for server of size " + size + " is " + ns.formatNumber(ns.getPurchasedServerCost(size)));
  let servers = ns.args[0];
  let targetServer = ns.args[1];
  let startServer = ns.args[2];
  if (startServer == undefined) { startServer = 0; }

  for(let i = startServer; i < servers; i++) {
    let serverName = "pserver-" + i;
    ns.killall(serverName);
    ns.scp(mainHackingScript, serverName);
    ns.exec(mainHackingScript, serverName, 1, targetServer)
  }
}