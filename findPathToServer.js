class serverClass {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
    }

    getName() { return this.name; }
    getParent() { return this.parent; }
}

/** @param {NS} ns */
export async function main(ns) {
    let serverToFind = ns.args[0];
    if (serverToFind == undefined) {
        ns.tprint("Please enter a server to find as first argument.");
        return;
    }

    let serverList = [];
    let servers = new Set(ns.scan());
    for (const server of servers) {
        let newServers = new Set(ns.scan(server));
        for (const newServer of newServers) {
            servers.add(newServer);
            let serverIsNew = true;
            for (const s of serverList) {
                if (s.getName() == newServer) { serverIsNew = false; }
            }
            if (serverIsNew) { serverList.push(new serverClass(newServer, server)); }
        }
    }

    let pathToServer = [];
    let currentNode = serverToFind;
    while (serverToFind != "home") {
        for (const server of serverList) {
            if (server.getName() == serverToFind) {
                // ns.tprint("Server found: " + serverToFind);
                pathToServer.push(server);
                serverToFind = server.getParent();
            }
            // ns.tprint(server.getName() + " is a child of " + server.getParent());
        }
        await ns.sleep(100);
    }

    let pathLength = pathToServer.length;
    let path = "home";
    for (let i = 0; i < pathLength; i++) {
        let server = pathToServer.pop();
        // ns.tprint("Server: " + server.getName() + ". Parent: " + server.getParent() + ".");
        path += " => " + server.getName();
    }
    ns.tprint("Path: " + path);
}