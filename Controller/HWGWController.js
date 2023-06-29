// Run HWGW Batches on a list of server
// 
// Args:
// 1: target
//

const mainHackingScript = "Controller/Brain.js";
const SHGWScripts = ["Cell/share.js", "Cell/hack.js", "Cell/grow.js", "Cell/weaken.js"];
let HWGWRequestIDCount = 0;
let HWGWBatchCount = 1;
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
    if (requiredThreads == 0) 
    {
        ns.print("Nil threads requested. Terminating request.");
        return "nonAttempt";
    }
    let requestID = "HWGWRequest-" + HWGWRequestIDCount++;

    requestPort.tryWrite("request");
    requestPort.tryWrite(requestID);
    requestPort.tryWrite(scriptToRun);
    requestPort.tryWrite(requiredThreads);
    requestPort.tryWrite(JSON.stringify([target]));

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
        // ns.print("Waiting on response. Current responsePort value: " + responsePort.peek());
        await ns.asleep(1);
    }

    responsePort.read();
    let response = responsePort.read();

    return response;
}

/** @param {NS} ns */
function calculateGrowThreads (ns, target) {
    let maxMoney = ns.getServerMaxMoney(target);
    let availableMoney = ns.getServerMoneyAvailable(target);
    let currentRatioMissing = 1-(availableMoney / maxMoney);
    // if all the money is taken in a single hack, allow for grow's $1 base increase)
    if (currentRatioMissing >= 1) { 
        currentRatioMissing = 1-(1/maxMoney);
    }
    let growthMultiplier = 1/(1-currentRatioMissing);
    console.log(currentRatioMissing," missing. ",availableMoney," currently available of max: ",maxMoney,". ",growthMultiplier," is growthMulti, with required threads: not yet known.");
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
async function runHWGWBatch (ns, target, minSec, maxMoney) {
    ns.print("Commencing batch ", HWGWBatchCount++);
    let hackTime = ns.getHackTime(target);
    let growTime = ns.getGrowTime(target);
    let weakenTime = ns.getWeakenTime(target);

    let hackPercent = 0.05
    let hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, maxMoney * hackPercent));
    let moneyPerThread = ns.hackAnalyze(target);
    let moneyStolen = hackThreads * moneyPerThread;
    let actualHackPercent = moneyStolen / maxMoney;
    
    // if all the money is taken in a single hack, allow for grow's $1 base increase)
    if (actualHackPercent >= 100) { 
        let actualHackPercent = (maxMoney-1)/maxMoney;
    }

    let growthMultiplier = 1/(1-actualHackPercent);
    if (growthMultiplier < 1) {
        growthMultiplier = 1;
    }

    let growThreads = Math.ceil(ns.growthAnalyze(target, growthMultiplier)); // Calculates inverse of hacked amount

    let hackSecurityEffect = ns.hackAnalyzeSecurity(hackThreads);
    let growSecurityEffect = ns.growthAnalyzeSecurity(growThreads);
    let weakenPerThread = ns.weakenAnalyze(1);
    let weakenThreadsPerHack = Math.ceil(hackSecurityEffect / weakenPerThread);
    let weakenThreadsPerGrow = Math.ceil(growSecurityEffect / weakenPerThread);

    let accruedWait = 0;
    let currentWait = 0;

    //From here: Actually execute threads
    let requestID_W1 = requestThreads (ns, getScriptName("W"), weakenThreadsPerHack, target);
    await checkResponse(ns, requestID_W1);
    currentWait = 50;

    accruedWait += currentWait;
    await ns.asleep(currentWait);
    let requestID_W2 = requestThreads (ns, getScriptName("W"), weakenThreadsPerHack, target);
    await checkResponse(ns, requestID_W2);
    currentWait = weakenTime - growTime - 25;

    accruedWait += currentWait;
    await ns.asleep(currentWait);
    let requestID_G = requestThreads (ns, getScriptName("G"), growThreads, target);
    await checkResponse(ns, requestID_G);
    currentWait = growTime - hackTime - 1000;

    accruedWait += currentWait;
    await ns.asleep(currentWait);
    let requestID_H = requestThreads (ns, getScriptName("H"), hackThreads, target);
    await checkResponse(ns, requestID_H);
    currentWait = hackTime;
    await ns.asleep(currentWait);

    releaseThreads(ns, requestID_W1);
    await checkResponse(ns, requestID_W1);
    releaseThreads(ns, requestID_W2);
    await checkResponse(ns, requestID_W2);
    releaseThreads(ns, requestID_G);
    await checkResponse(ns, requestID_G);
    releaseThreads(ns, requestID_H);
    await checkResponse(ns, requestID_H);
}

/** @param {NS} ns */
async function prepareServer (ns, target, minSec, maxMoney) {
    // console.log("Preparing server ", target);
    let requestPort = ns.getPortHandle(1);
    let responsePort = ns.getPortHandle(2);
    
    let currentMoney = ns.getServerMoneyAvailable(target);
    while (currentMoney < maxMoney) {
        let currentSec = ns.getServerSecurityLevel(target);
        if (currentSec > minSec) {
            let weakenThreads = calculateWeakenThreads(ns, target);
            if (weakenThreads >= 1) {
                ns.print("Weakening ", target, " with ", weakenThreads, " threads. Current security ", ns.formatNumber(currentSec), ", aiming for ", ns.formatNumber(minSec), ". Estimated time: ", ns.formatNumber(ns.getWeakenTime(target)/1000, 1), " seconds.");
                let requestID = requestThreads(ns, getScriptName("W"), weakenThreads, target);
    
                if (await checkResponse(ns, requestID) == "false") {
                ns.print("HWGW error weakening " + target + " during prep with request ID " + requestID);
                    weakenThreads = Math.ceil(calculateWeakenThreads(ns, target)/10);
                    ns.print("Attempting with less threads. Trying thread count: ",weakenThreads);
                    requestID = requestThreads(ns, getScriptName("W"), weakenThreads, target);
                    if (await checkResponse(ns, requestID) == "false") {
                        ns.print("Still failed. Aborting attempt. Waiting 1 minute, then restarting cycle.");
                        await ns.sleep(1000 * 60);
                        continue;
                    }
                }

                await ns.sleep(ns.getWeakenTime(target) + 100);
                releaseThreads(ns, requestID);        
                if (await checkResponse(ns, requestID) == "false") {
                    ns.print("HWGW error releasing weaken threads during prep with requestID " + requestID);
                }    
            } else {
                ns.print("Less than one weakening threads detected against ", target, " with ", weakenThreads, " threads. Current security ", ns.formatNumber(currentSec), ", aiming for ", ns.formatNumber(minSec), ".");
                await ns.sleep(1000);
                continue;
            }
         }
        else if (currentMoney < maxMoney) {
            let growThreads = calculateGrowThreads(ns, target);
            if (growThreads >= 1) {
                ns.print("Growing ", target, " with ", growThreads, " threads. Current money ", ns.formatNumber(currentMoney), ", aiming for ", ns.formatNumber(maxMoney), ". Estimated time: ", ns.formatNumber(ns.getGrowTime(target)/1000, 1), " seconds.");
                let requestID = requestThreads(ns, getScriptName("G"), growThreads, target);
                if (await checkResponse(ns, requestID) == "false") {
                    ns.print("HWGW error growing " + target + " during prep with request ID " + requestID);
                    if (growThreads > 1) {
                        growThreads = Math.ceil(calculateGrowThreads(ns, target)/10);
                        ns.print("Attempting with less threads. Trying thread count: ",growThreads);
                        requestID = requestThreads(ns, getScriptName("G"), growThreads, target);
                        if (await checkResponse(ns, requestID) == "false") {
                            ns.print("Still failed. Aborting attempt. Waiting 1 minute, then restarting cycle.");
                            await ns.sleep(1000 * 60);
                            continue;
                        }
                    }
                    currentMoney = ns.getServerMoneyAvailable(target);
                } else {
                    ns.print("Growing ",target," with ",growThreads," threads.")
                }

                await ns.sleep(ns.getGrowTime(target) + 100);
                currentMoney = ns.getServerMoneyAvailable(target);
                releaseThreads(ns, requestID);
                if (await checkResponse(ns, requestID) == "false") {
                    ns.print("HWGW error releasing grow threads during prep with requestID " + requestID);
                }
            } else {
                ns.print("Less than one grow threads detected against ",target, " with ",growThreads, " threads. Current money ", ns.formatNumber(currentMoney), ", aiming for ", ns.formatNumber(maxMoney), ".");
                await ns.sleep(1000);
                continue;
            }

        }
    }

    if (calculateWeakenThreads(ns, target) > 0) {
        let weakenThreads = calculateWeakenThreads(ns, target);
        if (weakenThreads == 0) {
            ns.print("Final weakening not indicated on ",target," as zero threads required. Continuing to batch.");
            return;
        }
        ns.print("Final weakening of ", target, " with ", weakenThreads, " threads. Current security ", ns.formatNumber(ns.getServerSecurityLevel(target)), ", aiming for ", ns.formatNumber(minSec),". Estimated time: ", ns.formatNumber(ns.getWeakenTime(target)/1000, 1), " seconds.");
        let requestID = requestThreads(ns, getScriptName("W"), weakenThreads, target);
        if (!requestID == "nonAttempt") {
            if (await checkResponse(ns, requestID) == "false") {
                ns.print("HWGW error weakening " + target + " during prep with request ID " + requestID);
                let continueWeakening = true;
                while (continueWeakening) {
                    weakenThreads = Math.ceil(calculateWeakenThreads(ns, target)/10);
                    ns.print("Attempting with less threads. Trying thread count: ",weakenThreads);
                    requestID = requestThreads(ns, getScriptName("W"), weakenThreads, target);

                    if (await checkResponse(ns, requestID) == "false") {
                        ns.print("Still failed. Aborting attempt. Waiting 1 minute, then restarting cycle.");
                        await ns.sleep(1000 * 60);
                        continue;
                    }
                    continueWeakening = Math.ceil(calculateGrowThreads(ns, target)) > 0;
                }
            } else {
                ns.print("Weakening ",target," with ",weakenThreads," threads.")
            }

            await ns.sleep(ns.getWeakenTime(target) + 100);
            releaseThreads(ns, requestID);
            if (await checkResponse(ns, requestID) == "false") {
                ns.print("HWGW error releasing weaken threads during prep with requestID " + requestID);
            }
        }
    }

    await ns.sleep(100);
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    requestPort = ns.getPortHandle(1);
    responsePort = ns.getPortHandle(2);

    let target = ns.args[0];

    let minSec = ns.getServerMinSecurityLevel(target);
    let maxMoney = ns.getServerMaxMoney(target);

    await prepareServer(ns, target, minSec, maxMoney);

    let weakenTime = ns.getWeakenTime(target);
    let currentTime = 0;

    while (true) {
        while (currentTime < weakenTime) {
            runHWGWBatch(ns, target, minSec, maxMoney);
            currentTime += 250;
            await ns.sleep(250);
        }

        ns.print("Threads submitted. Sleeping ", weakenTime/1000, " seconds.")
        await ns.sleep (weakenTime);

        ns.print("Pause completed. Re-preparing server if required.")
        await prepareServer(ns, target, minSec, maxMoney);
        currentTime = 0;
    }
}