// 
// Manage BladeBurner faction
//

import { getTimeStamp } from "lib/functionLibrary";

/** @param {NS} ns */
function staminaPercentage (ns) {
    let [current, max] = ns.bladeburner.getStamina();
    return current / max;
}

/** @param {NS} ns */
export async function main(ns) {
    let currentCity = "Sector-12";
    ns.disableLog("ALL");

    let blackOps = ns.bladeburner.getBlackOpNames();
    ns.tprint(blackOps);
    return;

    while (true) {
        if (ns.bladeburner.joinBladeburnerDivision()) {
            ns.bladeburner.joinBladeburnerFaction();
            if (ns.bladeburner.getCityChaos(currentCity) > 50) {
                ns.print(getTimeStamp," Chaos > 50. Initiating Diplomacy.");
                ns.bladeburner.startAction("General","Diplomacy");
            } else if (staminaPercentage(ns) < 0.95) {
                ns.print(getTimeStamp," Stamina < 95%. Initiating training.")
                ns.bladeburner.startAction("General","Training");
                await ns.sleep(ns.bladeburner.getActionTime("General", "Training"));
            } else if (ns.bladeburner.blac)

            ns.print(getTimeStamp()," Sleeping 1 minute.");
            await ns.sleep(60000);
        } else {
            ns.print("Unable to join Bladeburner Division ?why. Sleep 1 minute.");
            await ns.sleep(1000 * 60);
        }
    }
}