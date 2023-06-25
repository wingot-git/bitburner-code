const mainHackingScript = "Controller/Brain.js";
const adjunctHackingScripts = ["Cell/share.js", "Cell/hack.js", "Cell/grow.js", "Cell/weaken.js"];
const sleepSeconds = 60;

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    
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

    let upgradePrice = ns.getPurchasedServerUpgradeCost("pserver-" + (firstServerNumber), serverRam);
    ns.print("Upgrade price = " + ns.formatNumber(upgradePrice));
    
    let purchasedServers = 0;
    while (purchasedServers < numberOfServers) {
        let currentMoney = ns.getServerMoneyAvailable("home");      
        while (currentMoney < upgradePrice)
        {
            ns.print("Insufficient money for upgrade. Upgrade cost: ", ns.formatNumber(upgradePrice),", Available money: ", ns.formatNumber(currentMoney));
            await ns.sleep(1000 * 60);
            currentMoney = ns.getServerMoneyAvailable("home");
        }

        let serverName = "pserver-" + (firstServerNumber+purchasedServers++);
        ns.upgradePurchasedServer(serverName, serverRam);
        
        // Notify ThreadController of upgrade
        let requestPort = ns.getPortHandle(1);
        requestPort.tryWrite("upgrade");
        requestPort.tryWrite(serverName);

        await ns.sleep(1000);
    }
}