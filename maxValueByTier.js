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
function getRichestServerOfStrength(serverStrength) {
    
    let richestServer = "n00dles";

    for (const server of getServersOfStrength(serverStrength)) {
      if (NS.getServerMaxMoney(server) > NS.getServerMaxMoney(richestServer)) {
        richestServer = server;
      }
    }

    return richestServer;
}

/** @param {NS} ns */
export async function main(ns) {
  NS = ns;
  for (let i = 0; i <= 5; i++) {
    var richestServer = getRichestServerOfStrength(i);
    ns.tprint("Richest server of tier " + i + " is " + richestServer + " with a value of " + ns.formatNumber(ns.getServerMaxMoney(richestServer)) + ".");
  }
}