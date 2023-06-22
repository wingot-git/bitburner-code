const mainHackingScript = "Controller/Brain.js";
const adjunctHackingScripts = ["Cell/share.js", "Cell/hack.js", "Cell/grow.js", "Cell/weaken.js"];
const sleepSeconds = 60;

/** @param {NS} ns */
export async function main(ns) {
    let serverRam = ns.args[0];
    if (serverRam == "help")
    {
        ns.tprint("Purchase Server Function\nPurchases Servers and executes brain.\nargs[0] = ram per purchased server (defaults 64).\nargs[1] = number of servers (defaults 1).\nargs[2] = first server number (defaults 0).\nargs[3] = targetServer (defaults iron-gym).")
        return;
    }
    let numberOfServers = ns.args[1];
    let firstServerNumber = ns.args[2];
    let targetServer = ns.args[3];
    
    if (serverRam == undefined) { serverRam = 64; }
    if (numberOfServers == undefined) { numberOfServers = 1; }
    if (firstServerNumber == undefined) { firstServerNumber = 0; }
    if (targetServer == undefined) { targetServer = "iron-gym"; }

    let purchasePrice = ns.getPurchasedServerCost(serverRam);

    let purchasedServers = 0;
    while (purchasedServers < numberOfServers) {
        let currentMoney = ns.getServerMoneyAvailable("home");      
        while (currentMoney < purchasePrice)
        {
            await ns.sleep(1000 * 60);
            currentMoney = ns.getServerMoneyAvailable("home");
        }

        let serverName = "pserver-" + (firstServerNumber+purchasedServers++);
        ns.purchaseServer(serverName, serverRam);
        ns.scp(mainHackingScript, serverName);
        ns.scp(adjunctHackingScripts, serverName);
        // ns.tprint("Creating server: " + serverName + " and telling it to hack " + targetServer);
        ns.exec(mainHackingScript, serverName, 1, targetServer);
        await ns.sleep(1000 * sleepSeconds);
    }
}