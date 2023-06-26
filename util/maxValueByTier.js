function getAllServers(ns) {
  let servers = new Set(ns.scan());
   for (const server of servers) {
      let newServers = new Set(ns.scan(server));
      for (const newServer of newServers) {
        servers.add(newServer);
      }
    }
  return servers;
}

function getServersOfStrength(ns, strength) {
  let allServers = getAllServers(ns);
  let servers = new Set();
  for (const server of allServers) {
    if (ns.getServerNumPortsRequired(server) == strength) {
      servers.add(server);
    }
  }
  return servers;
}

/** @param {NS} ns */
function getRichestServerOfStrength(ns, serverStrength) {
    
    let richestServer = "n00dles";

    for (const server of getServersOfStrength(ns, serverStrength)) {
      if (ns.getServerMaxMoney(server) > ns.getServerMaxMoney(richestServer)) {
        richestServer = server;
      }
    }

    return richestServer;
}

/** @param {NS} ns */
export async function main(ns) {
  for (let i = 0; i <= 5; i++) {
    var richestServer = getRichestServerOfStrength(ns, i);
    ns.tprint("Richest server of tier " + i + " is " + richestServer + " with a value of " + ns.formatNumber(ns.getServerMaxMoney(richestServer)) + ".");
  }
}