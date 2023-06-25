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

/** @param {NS} ns */

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
    let numServers = ns.args[0];
    if (!numServers > 0) {
        ns.tprint("Arg 0 should be number of servers to add, received: ", numServers);
        return;
    }

    let requestPort = ns.getPortHandle(1);
    let responsePort = ns.getPortHandle(2);
    requestPort.clear();
    responsePort.clear();

    for (let i = 0; i < numServers; i++) {
        requestPort.tryWrite("add");
        requestPort.tryWrite("pserver-" + i);
    }
}