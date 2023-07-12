const hackingScript = "util/oldHack.js";
const targetServer = "n00dles";

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

    ns.print("Server: " + server + " has " + (maxRam-usedRam) + " GB RAM available, and can run " + maxInstances + " instances of ",hackingScript," without going over 90%.");
    ns.print("executing");
    ns.exec(hackingScript, server, maxInstances, targetServer);
}

/** @param {NS} ns */
export async function main(ns) {
    ns.print("Initiating script");
    let server = "home";
    ns.print("Commencing startup hack");
    setupHackScript(ns, server, targetServer);
    ns.print("Exiting script");
    await ns.sleep(5000); // Wait 5 seconds before terminating in case of needing to tail.
}