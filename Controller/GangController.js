// Manage gang
// 
// Args:
// 1: target
//

import { getTimeStamp } from "lib/functionLibrary";
const thisGang = "Slum Snakes";
const gangNames = ["Anthony","Bob","Clarice","David","Elliott","Fidelia","Gary","Harriett","Isaac","Jesus","Katrina","Lewis"];

/** @param {NS} ns */
function considerClash(ns) {
    let otherGangs = ns.gang.getOtherGangInformation();
    let gangKeys = Object.keys(otherGangs);
    let numGangs = gangKeys.length;
    let startClash = true;
    let maxPower = 0;
    let livingGangs = 0
    for (const gangName of gangKeys) {
        if (gangName == ns.gang.getGangInformation().faction) { continue; }
        if (otherGangs[gangName].power > maxPower) { maxPower = otherGangs[gangName].power * 1.5; }
        if (otherGangs[gangName].territory > 0) {
            livingGangs++;
            if (ns.gang.getChanceToWinClash(gangName) < .55) {
                startClash = false;
            }
        }
    }
    if (livingGangs == 0) {
        ns.print("No living gangs. No need to clash.");
        ns.gang.setTerritoryWarfare(false);
        maxPower = 0;
    }
    else if (startClash) {
        ns.print("Clash active.");
        ns.gang.setTerritoryWarfare(startClash);
    } else {
        ns.print("Clash inactive.");
    }

    return maxPower;
}

/** @param {NS} ns */
function ascendMember(ns, member) {
    let ascensionResult = ns.gang.getAscensionResult(member);
    if (ascensionResult != undefined) {
        let respectLostUnderHalfTotal = (ns.gang.getGangInformation(thisGang).respect * 0.5) > ns.gang.getMemberInformation(member).earnedRespect;
        if (ascensionResult.str > 1.3 && respectLostUnderHalfTotal) {
            ns.print("Ascending ", member);
            ns.gang.ascendMember(member);
        }
    }
}

/** @param {NS} ns */
function giveMemberTask(ns, member, powerTarget) {
    if (ns.gang.getMemberInformation(member).str < 600) {
        ns.print("Setting ", member, " to Train Combat because Strength < 600.");
        ns.gang.setMemberTask(member, "Train Combat");
    }
    else {
        // console.log("Current gang length: ",ns.gang.getMemberNames().length);

        if (ns.gang.getMemberNames().length < 12) {
            ns.print(member, " assigned to Terrorism because more members to recruit.");
            ns.gang.setMemberTask(member, "Terrorism");
        }
        else if (ns.gang.getGangInformation().wantedPenalty < 0.9900) {
            ns.print(member, " assigned to Terrorism because wanted level too high.");
            ns.gang.setMemberTask(member, "Terrorism");

        }
        else {
            ns.gang.setMemberTask(member, "Human Trafficking");
            if (ns.gang.getGangInformation().territory < 100) {
                let thisGangPower = ns.gang.getGangInformation().power;
                if (thisGangPower > powerTarget) {
                    ns.print(member, " assigned to Human Trafficking because power ", thisGangPower, " > target Power ", powerTarget);
                    ns.gang.setMemberTask(member, "Human Trafficking");
                } else {
                    ns.print(member, " assigned to Territory Warfare as power ", thisGangPower, " < target Power ", powerTarget);
                    ns.gang.setMemberTask(member, "Territory Warfare");
                }
            }
        }
    }
}

/** @param {NS} ns */
function recruitAsAble(ns, numCurrentGangMembers) {
    if (ns.gang.canRecruitMember()) {
        if (ns.gang.getGangInformation().length == numCurrentGangMembers || ns.gang.getGangInformation().length == undefined) {
            ns.print("Recruited ", gangNames[numCurrentGangMembers]);
            ns.gang.recruitMember(gangNames[numCurrentGangMembers++]);
        } else {
            let gangMembers = ns.gang.getMemberNames();
            for (let i = 0; i < numCurrentGangMembers; i++) {
                if (gangMembers.includes(gangNames[i])) {
                    ns.print(gangNames[i], " appears dead. Re-recruited ", gangNames[i]);
                    ns.gang.recruitMember(gangNames[i]);
                }
            }
        }
    }
    return numCurrentGangMembers;
}

/** @param {NS} ns */
async function createGang (ns) {
    let notInGang = true;
    while (notInGang) {
        if (ns.gang.inGang()) {
            notInGang = false;
            continue;
        } else {
            ns.print("Not in gang. Attempting creation with ",thisGang,".");
            if (ns.gang.createGang(thisGang) == false) {
                ns.print("Failed to create. Sleeping 10 minutes.");
                await ns.sleep(10 * 60 * 1000);
                continue;    
            } else {
                notInGang = false;
            }
        }
    }
}

/** @param {NS} ns */
export async function main(ns) {
    let numCurrentGangMembers = 0;
    let powerTarget = 10000;
    if (ns.gang.inGang()) {
        for (const member of ns.gang.getMemberNames()) {
            numCurrentGangMembers++;
        }
    }
    ns.disableLog("ALL");
    await createGang(ns);

    while (true) {
        numCurrentGangMembers = recruitAsAble(ns, numCurrentGangMembers);

        // console.clear();
        powerTarget = considerClash(ns);

        for (const member of ns.gang.getMemberNames()) {
            ascendMember(ns, member);
            giveMemberTask(ns, member, powerTarget);
        }

        ns.print(getTimeStamp()," Sleeping 1 minute.");
        await ns.sleep(60000);
    }
}