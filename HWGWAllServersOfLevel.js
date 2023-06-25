function getAllServers(ns) {
    let servers = new Set(ns.scan());
        for (const server of servers) {
        let newServers = new Set(ns.scan(server));
        for (const newServer of newServers) {
            servers.add(newServer);
        }
        }
    return servers;
}

function getServersOfStrength(ns, strength) {
    let allServers = getAllServers(ns);
    let servers = new Set();
    for (const server of allServers) {
        if (ns.getServerNumPortsRequired(server) == strength) {
        servers.add(server);
        }
    }
    return servers;
}

/** @param {NS} ns */
export async function main(ns) {
    let strength = ns.args[0];
    if (strength == undefined) { ns.tprint("Arg 0 should be strength, received ",strength); return;}

    let servers = getServersOfStrength(ns, strength);
    for (const server of servers) {
        if (server.includes("pserver") || server == "home)") { continue; }
        if (ns.getServerMaxMoney(server) == 0) { continue; }

        ns.run("Controller/HWGWController.js", 1, server);
        ns.sleep(1000);
    }
}