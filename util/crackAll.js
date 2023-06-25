// Global Variables
let NS = 0; // will be used to access NetScript globally
let skipToLevel = 0;

/** @param {NS} NS */
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

// Crack open input server
function crack(server) {
  if (NS.hasRootAccess(server)) {
    return;
  }

  let requiredPorts = NS.getServerNumPortsRequired(server);

  // Use minimally invasive programs to crack
  if (requiredPorts == 5) {
    NS.sqlinject(server);
  } 
  if (requiredPorts >= 4) {
    NS.httpworm(server);
  } 
  if (requiredPorts >= 3) {
    NS.relaysmtp(server);
  }
  if (requiredPorts >= 2) {
    NS.ftpcrack(server);
  } 
  if (requiredPorts >= 1) {
    NS.brutessh(server);
  }
  NS.nuke(server);
}

async function waitFor(filename) {
  // wait for file to exist
  while (!NS.fileExists(filename)) {
    NS.print("Waiting on " + filename);
    await NS.sleep(60000);
  }
}

/** @param {NS} ns */
async function crackLevel (ns, level) {
  for (const server of getServersOfStrength(level)) {
    crack(server);
  }
}

/** @param {NS} ns */
export async function main(ns) {
  NS = ns;
  let maxLevel = ns.args[0];
  if (maxLevel == undefined) {
    ns.print("Optional arg 0, for max level, not entered. Assuming max level 5.");
    maxLevel = 5;
  }

  await crackLevel(ns,0);
  if (maxLevel == 0) { return; }

  await waitFor("BruteSSH.exe");
  await crackLevel(ns,1);
  if (maxLevel == 1) { return; }

  await waitFor("FTPCrack.exe");
  await crackLevel(ns,2);
  if (maxLevel == 2) { return; }

  await waitFor("relaySMTP.exe");
  await crackLevel(ns,3);
  if (maxLevel == 3) { return; }

  await waitFor("HTTPWorm.exe");
  await crackLevel(ns,4);
  if (maxLevel == 4) { return; }

  await waitFor("SQLInject.exe");
  await crackLevel(ns,5);
}