const requiredProgram = ["BruteSSH.exe","FTPCrack.exe","relaySMTP.exe","HTTPWorm.exe","SQLInject.exe"];
const pServerRamForLevel = [64,1024,4096,16384,65536,262144];
const oneMillion = 1000000;

// requiredMoneyForLevel = 100m, 1b, 10b, 25b, 100b, 500b
const requiredMoneyForLevel = [100 * oneMillion, 1 * 1000 * oneMillion, 10 * 1000 * oneMillion, 25 * 1000 * oneMillion, 100 * 1000 * oneMillion, 500 * 1000 * oneMillion];

/** @param {NS} ns */
function getTimeStamp (ns) {
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return time;
}

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
async function levelUp(ns, level) {
  ns.print (getTimeStamp()," Waiting for level up to ",level);
  let waitForLevelUp = true;
  while (waitForLevelUp) {
    let servers = getServersOfStrength(ns, 1);
    let serversLength = servers.size;

    let hackableServers = 0;
    ns.print(getTimeStamp()," Checking hackability of servers of strength ",level);
    for (const server of servers) {
      if (ns.getServerRequiredHackingLevel(server)) {
        hackableServers += 1;
      }
    }

    if(hackableServers == serversLength) {
      ns.print("Sufficient hacking level exists for all servers of level ",level,". Continuing to finance check.");
      let availableFunds = ns.getServerMoneyAvailable("home");
      if (availableFunds > requiredMoneyForLevel[level]) {
        ns.print("$",ns.formatNumber(requiredMoneyForLevel[level])," - enough finances available for server purchases. Continuing to cracking program check.");
        if (ns.fileExists(requiredProgram[level])) {
          ns.print(requiredProgram[level]," exists. Setting up level ",level);
          if (level == 0) {
            ns.run("util/purchaseServers.js",1,pServerRamForLevel[0],25);
            await ns.sleep(1000);
          } else {
            ns.run("util/upgradeServers.js",1,pServerRamForLevel[level], 25);
          }
          await ns.sleep(1000);
          ns.run("util/setupHWGWOnAllServersOfLevel.js",1,level); 
          return;
          
        }
        else {
          ns.print(getTimeStamp()," All else checks out. Suggest purchasing ",requiredProgram[level]);
        }
      } else {
        ns.print("Inadequate finances for level ",level,". Current: $",ns.formatNumber(availableFunds),", Required: $",ns.formatNumber(requiredMoneyForLevel[level]));
      }
    }
  
    ns.print(getTimeStamp()," Not yet ready for level up. Sleeping for 1 minute.");
    await ns.sleep(1000 * 60);  
  }
}

/** @param {NS} ns */
export async function main(ns) {
  ns.tail("startup.js");
  ns.disableLog("disableLog");
  ns.disableLog("run");
  ns.disableLog("sleep");

  if (ns.getServerMoneyAvailable("home") < 100000000) {
    ns.print(getTimeStamp()," Starting with less than $100m. Allocating 2 minutes to running nestEgg.");

    ns.run("util/crackAll.js",1,0);
    await ns.sleep(1000);
    ns.run("util/generateNestEgg.js");
    await ns.sleep(1000 * 60 * 2);

    while (ns.getServerMoneyAvailable("home") < 100000000) {
      ns.print(getTimeStamp()," Available money remains below 100m. Continuing nest egg generation further 2 minutes.");
      await ns.sleep(1000 * 60 * 2);
    }
    ns.killall(ns.getHostname(),true);
  }

  ns.run("util/crackAll.js");
  ns.run("Controller/ThreadController.js");
  ns.tail("Controller/ThreadController.js");
  ns.run("Controller/resetThreadController.js");

  let level = 1;
  ns.print(getTimeStamp()," Awaiting level up to ",level);
  for (let i = 0; i <= 5; i++) {
    await levelUp(ns, i);
  }

  cleanupFiles();

  ns.print("Finished startup. Waiting 10s to allow to catch tail.");
  await ns.sleep(10000);
}