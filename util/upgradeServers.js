const mainHackingScript = "Controller/Brain.js";
const adjunctHackingScripts = ["Cell/share.js", "Cell/hack.js", "Cell/grow.js", "Cell/weaken.js"];
const sleepSeconds = 60;

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.ui.openTail();
    
    let serverRam = ns.args[0];
    if (serverRam == "help")
    {
        ns.tprint("Purchase Server Function\nPurchases Servers and executes brain.\nargs[0] = ram per purchased server (defaults 64).\nargs[1] = number of servers (defaults 1).\nargs[2] = first server number (defaults 0).\nargs[3] = targetServer (defaults iron-gym).")
        return;
    }
    let numberOfServers = ns.args[1];
    let firstServerNumber = ns.args[2];
    
    if (serverRam == undefined) { serverRam = 1024; }
    if (numberOfServers == undefined) { numberOfServers = 1; }
    if (firstServerNumber == undefined) { firstServerNumber = 0; }

    let purchasedServers = 0;
    while (purchasedServers < numberOfServers) {
        let serverName = "pserver-" + (firstServerNumber+purchasedServers++);
        let upgradePrice = ns.cloud.getServerUpgradeCost(serverName, serverRam);
        ns.print("Upgrade price = " + ns.format.number(upgradePrice));

        let currentMoney = ns.getServerMoneyAvailable("home");      
        while (currentMoney < upgradePrice)
        {
            ns.print("Insufficient money to upgrade server ",serverName," with ",ns.getServerMaxRam(serverName),"GB RAM to ",serverRam,"GB RAM. Upgrade cost: ", ns.format.number(upgradePrice),", Available money: ", ns.format.number(currentMoney));
            await ns.sleep(1000 * 60);
            currentMoney = ns.getServerMoneyAvailable("home");
        }

        ns.cloud.upgradeServer(serverName, serverRam);
        ns.print("Server ",serverName," upgraded to ",serverRam,"GB Ram. ThreadController notified.");
        
        // Notify ThreadController of upgrade
        let requestPort = ns.getPortHandle(1);
        requestPort.tryWrite("upgrade");
        requestPort.tryWrite(serverName);

        await ns.sleep(50);
    }

    await ns.sleep(10 * 1000);
    ns.ui.closeTail();
}