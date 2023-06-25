const hackingScript = "util/oldHack.js";

/** @param {NS} ns */
function setupHackScript(ns, server, targetServer) {
    // Hack targetServer
    // ns.scp(hackingScript, server);
    let maxRam = ns.getServerMaxRam(server) * 0.9;
    let usedRam = ns.getServerUsedRam(server);
    let availableRam = maxRam - usedRam;

    let maxInstances = Math.floor((availableRam / ns.getScriptRam(hackingScript)));
    if (maxInstances == 0) {
        return;
    }

    ns.tprint("Server: " + server + " has " + (maxRam-usedRam) + " GB RAM available, and can run " + maxInstances + " instances without going over 90%.");
    ns.tprint("executing");
    ns.exec(hackingScript, server, maxInstances, targetServer);
}

/** @param {NS} ns */
export async function main(ns) {
    ns.tprint("Initiating script");
    let server = "home";
    let targetServer = "n00dles";
    ns.tprint("Commencing startup hack");
    setupHackScript(ns, server, targetServer);
    ns.tprint("exiting script");
}