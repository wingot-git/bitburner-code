// Brain function that coordinates hacking attempts

/** @param {NS} ns */
function calculateWeakenThreads (ns, target)
{
    let minSecurity = ns.getServerMinSecurityLevel(target);
    let currentSecurity = ns.getServerSecurityLevel(target);
    if (currentSecurity < (minSecurity + 2)) { return 0; }

    let securityDecreasePerThread = ns.weakenAnalyze(1);
    let requiredWeakenThreads = Math.ceil((currentSecurity - minSecurity) / securityDecreasePerThread);
    return requiredWeakenThreads;
}

/** @param {NS} ns */
function calculateGrowThreads (ns, target) {
    let maxMoney = ns.getServerMaxMoney(target);
    let currentMoney = ns.getServerMoneyAvailable(target);
    let growthRequired = (maxMoney / currentMoney);
    if (growthRequired === Infinity) { growthRequired = 100; }
    let requiredGrowThreads = Math.ceil(ns.growthAnalyze(target, growthRequired));
    return requiredGrowThreads;
}

// Never hack below 50% of the servers max money
function calculateHackThreads (ns, target) {
    let percentMoneyStolenPerThread = ns.hackAnalyze(target);
    let serverMaxMoney = ns.getServerMaxMoney(target);
    let minimumBalance = serverMaxMoney * 0.5;
    let serverCurrentMoney = ns.getServerMoneyAvailable(target);
    let moneyStolenPerThread = percentMoneyStolenPerThread * serverCurrentMoney;

    if (serverCurrentMoney > minimumBalance) {
        let requiredHackThreads = Math.floor((serverCurrentMoney - minimumBalance) / moneyStolenPerThread);
        return requiredHackThreads;
    } else {
        return 0;
    }
}

function calculateAvailableThreads (ns, server, script) {
    let availableRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    let threadCost = ns.getScriptRam(script);
    let availableThreadsForScript = Math.floor(availableRAM / threadCost);
    return availableThreadsForScript;
}

function getScriptName(HGW)
{
    let script = "";
    switch (HGW) {
        case "hack":
            script = "hack.js";
            break;
        case "grow":
            script = "grow.js";
            break;
        case "weaken":
            script = "weaken.js";
            break;
        default:
            throw("Unexpected HGW type input to getScriptName: " + HGW);
    }
    
    return script;
}

/** @param {NS} ns */
async function sleepForHGW(ns, HGW, target) {
    let duration = 0;
    switch (HGW) {
        case "hack":
            duration = ns.getHackTime(target);
            // ns.tprint("Sleep duration for hack: " + duration);
            break;
        case "grow":
            duration = ns.getGrowTime(target);
            // ns.tprint("Sleep duration for grow: " + duration);
            break;
        case "weaken":
            duration = ns.getWeakenTime(target);
            // ns.tprint("Sleep duration for weaken: " + duration);
            break;
        default:
            throw("Unexpected HGW type input to sleepForHGW: " + HGW);
    }
    
    await ns.sleep(duration + 100);
}

/** @param {NS} ns */
async function execute (ns, HGW, server, requiredThreads, target) { 
    let script = getScriptName(HGW);
    let maxThreads = calculateAvailableThreads(ns, server, script);

    while (requiredThreads > maxThreads)
    {
        while (maxThreads == 0)
        {
            ns.print("Max threads 0. Sleeping 15 seconds.");
            await ns.sleep(1000 * 15);
            maxThreads = calculateAvailableThreads(ns, server, script);
        }

        ns.exec(script, server, maxThreads, target);
        requiredThreads -= maxThreads;
        await sleepForHGW(ns, HGW, target);
        maxThreads = calculateAvailableThreads(ns, server, script);
    }

    if (requiredThreads <= 0) {
        return;
    } else {
        ns.exec(script, server, requiredThreads, target);
        await sleepForHGW(ns, HGW, target);
    }
}

/** @param {NS} ns */
export async function main(ns) {
    let target = ns.args[0];
    // ns.tprint ("Brain server to hack: " + target);

    if (target == undefined) { target = "n00dles"; }
    let server = ns.getHostname();
    
    // Weaken and grow server prior to first hack
    let requiredWeakenThreads = calculateWeakenThreads(ns, target);
    await execute(ns, "weaken", server, requiredWeakenThreads, target);
    let requiredGrowThreads = calculateGrowThreads(ns, target);
    await execute(ns, "grow", server, requiredGrowThreads, target);
    requiredWeakenThreads = calculateWeakenThreads(ns, target);
    await execute(ns, "weaken", server, requiredWeakenThreads, target);

    while (true) {
        let requiredHackThreads = calculateHackThreads(ns, target);
        await execute(ns, "hack", server, requiredHackThreads, target);

        requiredWeakenThreads = calculateWeakenThreads(ns, target);
        await execute(ns, "weaken", server, requiredWeakenThreads, target);

        requiredGrowThreads = calculateGrowThreads(ns, target);
        await execute(ns, "grow", server, requiredGrowThreads, target);

        requiredWeakenThreads = calculateWeakenThreads(ns, target);
        await execute(ns, "weaken", server, requiredWeakenThreads, target);

        await ns.sleep(1000);
    }
}