// Global Variables
let NS = 0; // will be used to access NetScript globally
const lowHackingScript = "util/oldHack.js";
const mainHackingScript = "Controller/Brain.js";
const adjunctHackingScripts = ["Cell/share.js", "Cell/hack.js", "Cell/grow.js", "Cell/weaken.js"];
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

/** @param {NS} NS */
function setupHackScript (server, targetServer) {
  // Hack targetServer
  let mem = NS.getServerMaxRam(server);
  if (mem < 64) {
    NS.scp(lowHackingScript, server);
    let maxInstances = Math.floor ((mem / NS.getScriptRam(lowHackingScript)));
    if (maxInstances == 0) { return; }
    NS.print("Server: " + server + " has " + mem + " RAM, and can run " + maxInstances + " instances.");
    NS.exec(lowHackingScript, server, maxInstances, targetServer);
  } else {
    // mem >= 64, deploy Brain
    NS.print("Server: " + server + " has " + mem + " RAM, and can run Brain.");
    NS.scp(mainHackingScript, server);
    NS.scp(adjunctHackingScripts, server);
    NS.exec(mainHackingScript, targetServer);
    NS.exec(mainHackingScript, server, 1, targetServer);
  }
}

function getRichestServerOfStrength(strength) {
  // Search for richest Server
  let richestServer = "n00dles";
  for (const server of getServersOfStrength(strength)) {
    if (NS.getServerMaxMoney(server) > NS.getServerMaxMoney(richestServer)) {
      richestServer = server;
    }
  }
  return richestServer;
}

function findEasiestHack(strength) {
  // Search for easiest Server
  let easiestServer = "fulcrumassets";
  for (const server of getServersOfStrength(strength)) {
    if (NS.getServerRequiredHackingLevel(server) < NS.getServerRequiredHackingLevel(easiestServer)) {
      if (NS.getServerMaxMoney(server) > 0) {
        easiestServer = server;
      }
    }
  }
  return easiestServer;
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

async function setupLevel(level) {
  if (skipToLevel > level) { return; }
  let targetServer = findEasiestHack(level);
  crack (targetServer);
  let serversOfStrength = getServersOfStrength(level);
  let requiredHacking = NS.getServerRequiredHackingLevel(targetServer);
  
  let currentHackingLevel = NS.getHackingLevel();

  // Wait until able to hack current target
  while (NS.getHackingLevel() < requiredHacking)
  {
    NS.print("Too weak for level " + level + " server " + targetServer + ". Current hacking skill: " + currentHackingLevel + ". Required hacking skill: " + requiredHacking + ". Waiting 1 minute.");
    await NS.sleep(1000 * 60);
    currentHackingLevel = NS.getHackingLevel();
  }

  // attempt to stagger 
  for (const server of serversOfStrength) {
    crack(server);
    setupHackScript(server, targetServer);
    //await NS.sleep(12000 * level);
    await NS.sleep(1000);
  }
}

async function waitFor(filename) {
  // wait for file to exist
  while (!NS.fileExists(filename)) {
    NS.print("Waiting on " + filename);
    await NS.sleep(60000);
  }
}

function cleanupFiles(ns) {
  try {
    ns.rm("hackers-starting-handbook.lit");
    ns.rm("csec-test.msg");
    ns.rm("j0.msg");
    ns.rm("j1.msg");
    ns.rm("j2.msg");
    ns.rm("j3.msg");
    ns.rm("nitesec-test.msg");
  } catch { }
}

/** @param {NS} ns */
export async function main(ns) {
  NS = ns;
  skipToLevel = ns.args[0];

  await setupLevel(0);
  return;

  await waitFor("BruteSSH.exe");
  await setupLevel(1);

  await waitFor("FTPCrack.exe");
  await setupLevel(2);

  cleanupFiles();

  await waitFor("relaySMTP.exe");
  await setupLevel(3);

  await waitFor("HTTPWorm.exe");
  await setupLevel(4);

  await waitFor("SQLInject.exe");
  await setupLevel(5);
}