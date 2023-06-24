// Run HGW Batches on a list of server
// 
// Args:
// 1: target
//

const mainHackingScript = "Controller/Brain.js";
const SHGWScripts = ["Cell/share.js", "Cell/hack.js", "Cell/grow.js", "Cell/weaken.js"];
let HWGWRequestIDCount = 0;
let requestPort = undefined;
let responsePort = undefined;

function getScriptName(HGW)
{
    let script = "";
    switch (HGW) {
        case "share":
        case "S":
            script = SHGWScripts[0];
            break;
        case "hack":
        case "H":
            script = SHGWScripts[1];
            break;
        case "grow":
        case "G":
            script = SHGWScripts[2];
            break;
        case "weaken":
        case "W":
            script = SHGWScripts[3];
            break;
        default:
            throw("Unexpected HGW type input to getScriptName: " + HGW);
    }
    
    return script;
}

/** @param {NS} ns */
function requestThreads (ns, scriptToRun, requiredThreads, target) {
    let requestID = "HWGWRequest-" + HWGWRequestIDCount++;

    requestPort.tryWrite("request");
    requestPort.tryWrite(requestID);
    requestPort.tryWrite(scriptToRun);
    requestPort.tryWrite(requiredThreads);
    requestPort.tryWrite(JSON.stringify(target));

    return requestID;
}

/** @param {NS} ns */
function releaseThreads (ns, requestID) {
    requestPort.tryWrite("release");
    requestPort.tryWrite(requestID);   
}

/** @param {NS} ns */
async function checkResponse (ns, requestID) {
    while (responsePort.peek() != requestID) {
        ns.print("Waiting on response. Current responsePort value: " + responsePort.peek());
        await ns.sleep(10);
    }

    responsePort.read();
    let response = responsePort.read();

    return response;
}

/** @param {NS} ns */
function calculateGrowThreads (ns, target) {
    let maxMoney = ns.getServerMaxMoney;
    let availableMoney = ns.getServerMoneyAvailable;
    let currentPercent = availableMoney / maxMoney;
    let growthMultiplier = 1/(1-actualHackPercent)
    let requiredThreads = Math.ceil(ns.growthAnalyze(target, growthMultiplier));
    return requiredThreads;
}

/** @param {NS} ns */
function calculateWeakenThreads (ns, target) {
    let securityLevel = ns.getServerSecurityLevel(target);
    let minSecurity = ns.getServerMinSecurityLevel(target);
    let requiredDecrease = securityLevel - minSecurity;

    let securityRemovedPerThread = ns.weakenAnalyze(1);
    let requiredThreads = Math.ceil(requiredDecrease / securityRemovedPerThread);
    return requiredThreads;
}

/** @param {NS} ns */
function runHWGWBatch (ns, target, minSec, maxMoney) {
    let hackTime = ns.getHackTime(target);
    let growTime = ns.getGrowTime(target);
    let weakenTime = ns.getWeakenTime(target);

    let hackPercent = 0.05
    let hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, maxMoney * hackPercent));
    let moneyPerThread = ns.hackAnalyze(target);
    let moneyStolen = hackThreads * moneyPerThread;
    let actualHackPercent = moneyStolen / maxMoney;
    let growThreads = Math.ceil(ns.growthAnalyze(target, 1/(1-actualHackPercent))); // Calculates inverse of hacked amount

    let hackSecurityEffect = ns.hackAnalyzeSecurity(hackThreads);
    let growSecurityEffect = ns.growthAnalyzeSecurity(growThreads);
    let weakenPerThread = ns.weakenAnalyze(1);
    let weakenThreadsPerHack = Math.ceil(hackSecurityEffect / weakenPerThread);
    let weakenThreadsPerGrow = Math.ceil(growSecurityEffect / weakenPerThread);

    ns.tprint("Hack threads: " + hackThreads);
    ns.tprint("Weaken threads to counteract hack: " + weakenThreadsPerHack);
    ns.tprint("Grow threads: " + growThreads);
    ns.tprint("Weaken threads to counteract grow: " + weakenThreadsPerGrow);
    ns.tprint("Total time = " + weakenTime);

    let requestPort = ns.getPortHandle(1);
    let responsePort = ns.getPortHandle(2);
    let requestID = pid + "1";
    let accruedWait = 0;
/*     while (!requestPort.tryWrite("request", requestID, SHGWScripts[4], weakenThreadsPerHack, JSON.stringify(target))) {
        ns.sleep (20);
    }
    while (!responsePort.peek() == requestID) {
        ns.sleep(20);
    } */
}

/** @param {NS} ns */
async function prepareServer (ns, target, minSec, maxMoney) {
    let requestPort = ns.getPortHandle(1);
    let responsePort = ns.getPortHandle(2);
    
    let currentMoney = ns.getServerMoneyAvailable(target);
    while (currentMoney < maxMoney) {
        let currentSec = ns.getServerSecurityLevel(target);
        if (currentSec > minSec) {
            let requestID = requestThreads(ns, getScriptName("W"), calculateWeakenThreads(ns, target), target);
            if (!await checkResponse(ns, requestID)) {
                ns.tprint("HWGW error weakening " + target + " during prep with request ID " + requestID);
            }

            await ns.sleep(ns.getWeakenTime(target) + 100);
            releaseThreads(ns, requestID);
            if (!await checkResponse(ns, requestID)) {
                ns.tprint("HWGW error releasing weaken threads during prep with requestID " + requestID);
            }
        }
        else if (currentMoney < maxMoney) {
            let requestID = requestThreads(ns, getScriptName("G"), calculateGrowThreads(ns, target), target);
            if (!await checkResponse(ns, requestID)) {
                ns.tprint("HWGW error growing " + target + " during prep with request ID " + requestID);
            }

            await ns.sleep(ns.getGrowTime(target) + 100);
            releaseThreads(ns, requestID);
            if (!await checkResponse(ns, requestID)) {
                ns.tprint("HWGW error releasing grow threads during prep with requestID " + requestID);
            }

            currentMoney = ns.getServerMoneyAvailable(target);
        }
    }

    let requestID = requestThreads(ns, getScriptName("W"), calculateWeakenThreads(ns, target), target);
    if (!await checkResponse(ns, requestID)) {
        ns.tprint("HWGW error weakening " + target + " during prep with request ID " + requestID);
    }

    await ns.sleep(ns.getWeakenTime(target) + 100);
    releaseThreads(ns, requestID);
    if (!await checkResponse(ns, requestID)) {
        ns.tprint("HWGW error releasing weaken threads during prep with requestID " + requestID);
    }

    await ns.sleep(100);
}

/** @param {NS} ns */
export async function main(ns) {
    requestPort = ns.getPortHandle(1);
    responsePort = ns.getPortHandle(2);

    let target = ns.args[0];
    let minSec = ns.getServerMinSecurityLevel(target);
    let maxMoney = ns.getServerMaxMoney(target);

    await prepareServer(ns, target, minSec, maxMoney);

    // runHWGWBatch(ns, target, minSec, maxMoney);
}