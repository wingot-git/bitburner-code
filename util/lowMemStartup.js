import { getTimeStamp } from "lib/functionLibrary";

let fullStartup = "util/fullStartup.js";
const requiredProgram = ["startup.js","BruteSSH.exe","FTPCrack.exe","relaySMTP.exe","HTTPWorm.exe","SQLInject.exe"];
const pServerRamForLevel = [64,1024,4096,16384,65536,262144];
const oneMillion = 1000000;

// requiredMoneyForLevel = 100m, 1b, 10b, 25b, 100b, 500b
const requiredMoneyForLevel = [100 * oneMillion, 1 * 1000 * oneMillion, 10 * 1000 * oneMillion, 25 * 1000 * oneMillion, 100 * 1000 * oneMillion, 500 * 1000 * oneMillion];

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
function isSourceFileAvailable (ns, SFnum) {
    // lowMem, can't afford singularity, time to brute force
    switch(SFnum) {
    case 2:
      try {
        ns.gang.getGangInformation("Slum Snakes");
        return true;
      } catch {
        return false;
      }
    }
}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("disableLog");
  ns.disableLog("run");
  ns.disableLog("sleep");

  if (isSourceFileAvailable(ns, 2)) {
    ns.run("Controller/GangController.js");
    ns.tail("Controller/GangController.js");
  }

  ns.run("util/purchaseServers.js",1,8,25);

  if (ns.getServerMoneyAvailable("home") < (150 * oneMillion) && ns.getServerMaxRam("home") > 2*ns.getScriptRam(fullStartup)) {
    ns.print(getTimeStamp()," Starting with less than $150m. Allocating 2 minutes to running nestEgg.");

    ns.run("util/crackAll.js",1,0);
    await ns.sleep(1000);
    ns.run("util/generateNestEgg.js");
    await ns.sleep(1000 * 60 * 2);

    while (ns.getServerMoneyAvailable("home") < (150 * oneMillion)) {
      ns.print(getTimeStamp()," Available money remains below 150m. Continuing nest egg generation further 2 minutes.");
      await ns.sleep(1000 * 60 * 2);
      ns.print("Attempting RAM upgrade, utilising sing/upgradeRam.js.")
      ns.run("sing/upgradeRam.js");
    }
    ns.killall(ns.getHostname(),true);
    
    if (isSourceFileAvailable(ns, 2)) {
      ns.run("Controller/GangController.js");
      ns.tail("Controller/GangController.js");
    }
  }

  ns.run(fullStartup);
  ns.tail(fullStartup);

  ns.print("Finished startup. Waiting 10s to allow to catch tail.");
  await ns.sleep(10000);
}