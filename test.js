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

    let hardestServer = "n00dles";
    for (const server of getServersOfStrength(serverStrength)) {
        //ns.tprint("Server: " + server + " has " + ns.formatNumber(ns.getServerMaxMoney(server)) + " available and requires " + ns.getServerRequiredHackingLevel(server) + " hacking level.");
        if (ns.getServerRequiredHackingLevel(server) > ns.getServerRequiredHackingLevel(hardestServer)) {
          hardestServer = server;
        }
    }

    ns.tprint (hardestServer + " is the hardest server to hack with a required hack of " + ns.getServerRequiredHackingLevel(hardestServer));
}