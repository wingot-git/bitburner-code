/** @param {NS} ns */
export async function main(ns) {
    var target = ns.args[0];
    var securityThresh = ns.getServerMinSecurityLevel(target);
    var moneyThresh = ns.getServerMaxMoney(target) * 0.90;
  
    ns.disableLog("ALL");
  
    while (true) {
      if (ns.getServerSecurityLevel(target) > securityThresh + 0.5) {
        ns.print("Weaken. Current: " + ns.format.number(ns.getServerSecurityLevel(target)) + ". Min: " + ns.format.number((securityThresh)))
        await ns.weaken(target);
      } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
        ns.print("Grow. Current: $" + ns.format.number(ns.getServerMoneyAvailable(target)) + ". Target: $" + ns.format.number(moneyThresh))
        await ns.grow(target);
      } else {
        ns.print("Hack. Current: $" + ns.format.number(ns.getServerMoneyAvailable(target)) + ".")
        await ns.hack(target);
      }
    }
  }