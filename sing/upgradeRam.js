/** @param {NS} ns */
export async function main(ns) {
    if (ns.singularity.getUpgradeHomeRamCost() < ns.getServerMoneyAvailable("home"))    {
        ns.singularity.upgradeHomeRam();
    }
}