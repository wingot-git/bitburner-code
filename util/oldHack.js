/** @param {NS} ns */
export async function main(ns) {
    var target = ns.args[0];
    var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
  
    ns.disableLog("ALL");
  
    while (true) {
      if (ns.getServerSecurityLevel(target) > securityThresh) {
        ns.print("Weaken. Current: " + ns.formatNumber(ns.getServerSecurityLevel(target)) + ". Min: " + ns.formatNumber(securityThresh - 5))
        await ns.weaken(target);
      } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
        ns.print("Grow. Current: $" + ns.formatNumber(ns.getServerMoneyAvailable(target)) + ". Target: $" + ns.formatNumber(moneyThresh))
        await ns.grow(target);
      } else {
        ns.print("Hack. Current: $" + ns.formatNumber(ns.getServerMoneyAvailable(target)) + ".")
        await ns.hack(target);
      }
    }
  }