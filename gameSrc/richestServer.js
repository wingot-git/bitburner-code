let NS = 0; // will be used to access NetScript globally

function getAllServers() {
  let servers = new Set(NS.scan());
   for (const server of servers) {
      let newServers = new Set(NS.scan(server));
      for (const newServer of newServers) {
        servers.add(newServer);
      }
    }
  return servers;
}

function getServersOfStrength(strength) {
  let allServers = getAllServers();
  let servers = new Set();
  for (const server of allServers) {
    if (NS.getServerNumPortsRequired(server) == strength) {
      servers.add(server);
    }
  }
  return servers;
}

/** @param {NS} ns */
export async function main(ns) {
    NS = ns;
    let richestServer = "n00dles";
    let serverStrength = ns.args[0];
    // ns.tprint("Desired server strength: " + serverStrength);

    for (const server of getServersOfStrength(serverStrength)) {
      if (ns.getServerMaxMoney(server) > ns.getServerMaxMoney(richestServer)) {
        richestServer = server;
      }
    }

    // ns.tprint("Richest Server: " + richestServer);
    // ns.tprint(richestServer + "'s MaxMoney: " +ns.formatNumber(ns.getServerMaxMoney(richestServer)));

    return richestServer;
}