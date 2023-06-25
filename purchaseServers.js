// Purchase servers and run Brain
// 
// Args:
// 1: ram per server
// 2: number of servers
// 3: first server number
// 4: target server for hack
//

const mainHackingScript = "Controller/Brain.js";
const adjunctHackingScripts = ["Cell/share.js", "Cell/hack.js", "Cell/grow.js", "Cell/weaken.js"];
const sleepSeconds = 1;

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
    let executeBrain = true;
    
    if (serverRam == undefined) { serverRam = 64; }
    if (numberOfServers == undefined) { numberOfServers = 1; }
    if (firstServerNumber == undefined) { firstServerNumber = 0; }
    if (targetServer == undefined) { executeBrain = false; }

    let purchasePrice = ns.getPurchasedServerCost(serverRam);

    ns.print("Cost for server of size " + serverRam + " is " + ns.formatNumber(purchasePrice));

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

        // Notify ThreadController of existence
        let requestPort = ns.getPortHandle(1);
        requestPort.tryWrite("add");
        requestPort.tryWrite(serverName);

        if (executeBrain) {
            ns.scp(mainHackingScript, serverName);
            ns.scp(adjunctHackingScripts, serverName);
            // ns.tprint("Creating server: " + serverName + " and telling it to hack " + targetServer);
            ns.exec(mainHackingScript, serverName, 1, targetServer);
        }
        await ns.sleep(1000 * sleepSeconds);
    }
}