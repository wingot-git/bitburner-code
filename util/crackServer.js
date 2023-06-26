/** @param {NS} ns */
function crack(ns, server) {
    if (ns.hasRootAccess(server)) {
      return;
    }

    let requiredPorts = ns.getServerNumPortsRequired(server);

    // Use minimally invasive programs to crack
    if (requiredPorts == 5) {
      ns.sqlinject(server);
    } 
    if (requiredPorts >= 4) {
      ns.httpworm(server);
    } 
    if (requiredPorts >= 3) {
      ns.relaysmtp(server);
    }
    if (requiredPorts >= 2) {
      ns.ftpcrack(server);
    } 
    if (requiredPorts >= 1) {
      ns.brutessh(server);
    }
    ns.nuke(server);
}

/** @param {NS} ns */
export async function main(ns) {
    let target = ns.args[0];
    crack(ns, target);
}