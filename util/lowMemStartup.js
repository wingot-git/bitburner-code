import { getTimeStamp } from "lib/functionLibrary";

let fullStartup = "util/fullStartup.js";
let upgradeRam = "sing/upgradeRam.js";
const requiredProgram = ["startup.js","BruteSSH.exe","FTPCrack.exe","relaySMTP.exe","HTTPWorm.exe","SQLInject.exe"];
const pServerRamForLevel = [64,1024,4096,16384,65536,262144];
const oneMillion = 1000000;
const homeServerUpgradeCost = [10100000, 31900000, 101000000, 319000000, 1010000000, 3190000000]

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
  ns.disableLog("ALL");

  for (let i = 0; i <= 5; i++) {
    if (ns.getServerMoneyAvailable("home") > homeServerUpgradeCost[i] && (ns.getScriptRam(upgradeRam) < (ns.getServerMaxRam("home") - ns.getScriptRam(ns.getScriptName())))) {
      if (ns.getServerMaxRam("home") == 32*Math.pow(2, i)) {
        ns.run(upgradeRam);
        await ns.sleep(100);
      }
    } else {
      break;
    }
  }

  if (isSourceFileAvailable(ns, 2)) {
    ns.run("Controller/GangController.js");
    ns.tail("Controller/GangController.js");
  }

  if (ns.getServerMoneyAvailable("home") < (150 * oneMillion) || ns.getServerMaxRam("home") < 2*ns.getScriptRam(fullStartup)) {
    ns.print(getTimeStamp()," Starting with less than $150m. Allocating 2 minutes to running nestEgg.");

    ns.run("util/crackAll.js",1,0);
    await ns.sleep(1000);
    ns.run("util/generateNestEgg.js");
    await ns.sleep(1000 * 60 * 2);

    while (ns.getServerMoneyAvailable("home") < (150 * oneMillion) || ns.getServerMaxRam("home") < 2*ns.getScriptRam(fullStartup)) {
      if (ns.getServerMoneyAvailable("home") < (150 * oneMillion)) {
        ns.print(getTimeStamp()," Available money remains below 150m. Continuing nest egg generation further 2 minutes.");
      } else if (ns.getServerMaxRam("home") < 2*ns.getScriptRam(fullStartup)) {
        ns.print(getTimeStamp()," Available RAM insufficient to run ",fullStartup,", continuing further nest egg generation 2 minutes.");
      }
      await ns.sleep(1000 * 60 * 2);
      ns.print("Attempting RAM upgrade, utilising sing/upgradeRam.js.")
      if (ns.getScriptRam(upgradeRam) < (ns.getServerMaxRam("home") - ns.getScriptRam(ns.getScriptName()))) {
        ns.killall(ns.getHostname(), true);
        ns.run(upgradeRam);

        // Restart gang controller
        if (isSourceFileAvailable(ns, 2)) {
          ns.run("Controller/GangController.js");
          ns.tail("Controller/GangController.js");
        }
        continue;
      } else {
        let currentMoney = ns.getServerMoneyAvailable("home");
        switch (ns.getServerMaxRam("home")) {
          case 32:
            if (currentMoney < homeServerUpgradeCost[0]) {
              continue;
            }
          case 64:
            if (currentMoney < homeServerUpgradeCost[1]) {
              continue;
            }
          case 128:
            if (currentMoney < homeServerUpgradeCost[2]) {
              continue;
            }
          case 256:
            if (currentMoney < homeServerUpgradeCost[3]) {
              continue;
            }
          case 512:
            if (currentMoney < homeServerUpgradeCost[4]) {
              continue;
            }
          case 1024:
            if (currentMoney < homeServerUpgradeCost[5]) {
              continue;
            }
          default:
            break;
        }
        ns.tprint("Insufficient ram to run ",upgradeRam,". Suggest purchasing RAM upgrade.")
      }
    }
    ns.killall(ns.getHostname(),true);
  }

  ns.run(fullStartup);
  ns.tail(fullStartup);

  ns.print("Finished startup. Full Startup should have taken over Waiting 10s to allow to catch tail.");
  await ns.sleep(10000);
  ns.closeTail(ns.getRunningScript().pid);
}