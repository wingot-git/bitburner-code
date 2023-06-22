class serverClass {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
    }

    get name() { return this.name; }
    get parent() { return this.parent; }
}

/** @param {NS} ns */
export async function main(ns) {
    let serverList = [];
    let servers = new Set(ns.scan());
    for (const server of servers) {
        let newServers = new Set(ns.scan(server));
        for (const newServer of newServers) {
            servers.add(newServer);
            serverList.add(new serverClass(newServer, server));
        }
    }

    for (const server of serverList) {
        ns.tprint(server.name() + " is a child of " + server.parent());
    }
}