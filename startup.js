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
  if (ns.getServerMoneyAvailable("home") < 1000000) {
    ns.print("Starting with less than $1m. Allocating 10 minutes to running nestEgg.");

    ns.run("util/crackAll.js",1,0);
    await ns.sleep(1000);
    ns.run("util/generateNestEgg.js");
    await ns.sleep(1000 * 60 * 10);
    ns.killall(ns.getHostname(),true);
  }

  ns.run("util/crackAll.js");
  ns.run("Controller/ThreadController.js");
  ns.run("purchaseServers",1,64,25);
  ns.run("HWGWAllServersOfLevel",1,0);
  cleanupFiles();
}