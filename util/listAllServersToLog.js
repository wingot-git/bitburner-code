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
export async function main(ns) {
    let servers = getAllServers(ns);
    for (const server of servers) {
        console.log(server);
    }
}