// Backdoor all servers up to specified level
// 
// Args:
// 1: max level to backdoor
//

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

class serverClass {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
    }

    getName() { return this.name; }
    getParent() { return this.parent; }
}

async function connectTo(serverToFind) {
  NS.print("Connecting to " + serverToFind);
    let serverList = [];
    let servers = new Set(NS.scan());
    for (const server of servers) {
        let newServers = new Set(NS.scan(server));
        for (const newServer of newServers) {
            servers.add(newServer);
            let serverIsNew = true;
            for (const s of serverList) {
                if (s.getName() == newServer) { serverIsNew = false; }
            }
            if (serverIsNew) { serverList.push(new serverClass(newServer, server)); }
        }
    }

    let pathToServer = [];
    let currentNode = serverToFind;
    while (serverToFind != "home") {
        for (const server of serverList) {
            if (server.getName() == serverToFind) {
                // NS.tprint("Server found: " + serverToFind);
                pathToServer.push(server);
                serverToFind = server.getParent();
            }
            // NS.tprint(server.getName() + " is a child of " + server.getParent());
        }
    }

    let pathLength = pathToServer.length;
    let path = "";
    for (let i = 0; i < pathLength; i++) {
        let server = pathToServer.pop();
        // NS.tprint("Server: " + server.getName() + ". Parent: " + server.getParent() + ".");
        // path += "connect " + server.getName() + "; ";
        await NS.singularity.connect(server.getName());
    }
    // NS.print("Command line input: " + path);

    await NS.sleep(50);
}

// Backdoor input server
async function backdoor(server) {
    if (NS.getServer(server).backdoorInstalled) {
      NS.print("Backdoor already installed on " + server);
      return;
    }

    if (NS.hasRootAccess(server)) {
    await connectTo(server);

    NS.print("Backdooring " + server);
    await NS.singularity.installBackdoor(server);

    await NS.singularity.connect("home");

    await NS.sleep(50);
  }
  else
  {
    NS.print("ERROR: Cannot backdoor " + server + " because we do not have root access.");
  }
}

async function waitFor(filename) {
  // wait for file to exist
  while (!NS.fileExists(filename)) {
    NS.print("Waiting on " + filename);
    await NS.sleep(60000);
  }
}

/** @param {NS} ns */
async function backdoorLevel (ns, level) {
  for (const server of getServersOfStrength(level)) {
    if (ns.getServer(server).purchasedByPlayer)
    {
      NS.print("Skipping owned server ",server,".");;
    }
    else {
      await backdoor(server);
    }
  }
}

/** @param {NS} ns */
export async function main(ns) {
  NS = ns;

  ns.ui.openTail();

  ns.disableLog("scan");
  ns.disableLog("getServerNumPortsRequired");

  let maxLevel = ns.args[0];
  if (maxLevel == undefined) {
    ns.print("Optional arg 0, for max level, not entered. Assuming max level 5.");
    maxLevel = 5;
  }

  await backdoorLevel(ns,0);
  if (maxLevel == 0) { return; }

  await waitFor("BruteSSH.exe");
  await backdoorLevel(ns,1);
  if (maxLevel == 1) { return; }

  await waitFor("FTPCrack.exe");
  await backdoorLevel(ns,2);
  if (maxLevel == 2) { return; }

  await waitFor("relaySMTP.exe");
  await backdoorLevel(ns,3);
  if (maxLevel == 3) { return; }

  await waitFor("HTTPWorm.exe");
  await backdoorLevel(ns,4);
  if (maxLevel == 4) { return; }

  await waitFor("SQLInject.exe");
  await backdoorLevel(ns,5);  
}