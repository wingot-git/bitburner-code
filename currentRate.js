/** @param {NS} ns */
export async function main(ns) {
    var duration = 60000;
    var Money = ns.getServerMoneyAvailable("home");
    await ns.sleep(duration);
    var Change = ns.getServerMoneyAvailable("home") - Money;
    var Rate = Change / duration * 1000;
    ns.print ("Current Money Rate: " + ns.formatNumber(Rate, 2) + "/second.");
    ns.tprint ("Current Money Rate: " + ns.formatNumber(Rate, 2) + "/second.");
    await ns.sleep(10000);
  }