// Manage gang
// 
// Args:
// 1: target
//

const gangNames = ["Anthony","Bob","Clarice","David","Elliott","Fidelia","Gary","Harriett","Isaac","Jesus","Katrina","Lewis"];

/** @param {NS} ns */
function functionName (ns) {
    
}

/** @param {NS} ns */
export async function main(ns) {
    let numGangMembers = 0;
    if (ns.gang.inGang()) {
        for (const member of ns.gang.getMemberNames()) {
            numGangMembers++;
        }
    }
    ns.disableLog("ALL");
    while (true) {
        if (ns.gang.inGang() == false) {
            if (ns.gang.createGang("Slum Snakes") == false) {
                ns.print("Not in a gang. Failed to create. Sleeping 1 minute.");
                await ns.sleep(60000);
                continue;    
            }
        }
        if (ns.gang.canRecruitMember()) {
            ns.print("Recruited ",gangNames[numGangMembers]);
            ns.gang.recruitMember(gangNames[numGangMembers++]);
        }
        for (const member of ns.gang.getMemberNames()) {
            let memberInfo = ns.gang.getMemberInformation(member);
            let ascensionResult = ns.gang.getAscensionResult(member);
            if (ascensionResult != undefined) {
                if (ascensionResult.str > memberInfo.str_asc_mult * 1.3) {
                    ns.gang.ascendMember(member);
                }
            }
            if (memberInfo.str < 600) {
                ns.gang.setMemberTask(member, "Train Combat");
            }
            else {
                if (numGangMembers < 12 || ns.gang.getGangInformation().wantedPenalty < 0.9990) {
                    ns.gang.setMemberTask(member, "Terrorism");
                }
                else {
                    ns.gang.setMemberTask(member, "Human Trafficking");
                }
            }
        }

        ns.print("Sleeping 1 minute.");
        await ns.sleep(60000);
    }
}