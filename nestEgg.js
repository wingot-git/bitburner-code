const hackingScript = "hack.js";

function setupHackScript (ns, server, targetServer) {
    // Hack targetServer
    // ns.scp(hackingScript, server);
    let mem = ns.getServerMaxRam(server);
    let maxInstances = Math.floor ((mem / ns.getScriptRam(hackingScript) * 0.85));
    if (maxInstances == 0) { return; }
    ns.tprint("Server: " + server + " has " + mem + " GB RAM, and can run " + maxInstances + " instances.");
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