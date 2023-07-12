// Manage available server resources + threads
// 
// Utilises ports to communicate
// Port 1: Send requests
// Port 2: Responses (requestID, true/false)
// 
// Manage servers
// Port 1 args: "add/upgrade", hostname;
// Port 2: Nil response.
//
// Request threads
// Port 1 args: "request", requestID, scriptToRun, requiredThreads, args[] (as JSON);
// Port 2: Response (requestID, true/false)
//
// Release threads
// Port 1 args: "release", requestID;
// Port 2: Response (requestID, "true/false")
//
// Reset
// Port 1 args: "reset"
// Port 2: Nil response
//

const servers = [];
const threads = new Set();

class server {
    constructor(hostname, ram) {
        this.hostname = hostname;
        this.maxRam = ram;
        this.usedRam = 0;
    }

    getHostname() { return this.hostname; }

    getRamAvailable() { return (this.maxRam - this.usedRam); }

    getMaxRam() { return this.maxRam; }

    allocateRam(ramToUtilise) {
        if (this.getRamAvailable()*1.001 > ramToUtilise) {
            this.usedRam += ramToUtilise;
        } else {
            throw new Error('Insufficient available ram on ' + this.getHostname() + ' to allocate ' + ramToUtilise + ". MaxRam = " + this.maxRam + ", UsedRam = " + this.usedRam + ", free ram = " + this.getRamAvailable());
        }
    }

    releaseRam(ramToFree) {
        if (ramToFree <= this.usedRam) {
            this.usedRam -= ramToFree;
            if (this.usedRam < 0) { this.usedRam = 0; }
        } else {
            this.usedRam = 0;
        }
    }

    refreshAvailableRam(newMaxRam) {
        this.maxRam = newMaxRam;
    }
}

/** @param {NS} ns */
class thread {
    constructor (requestID, server, script, threads) {
        this.requestID = requestID;
        this.server = server;
        this.script = script;
        this.threads = threads;
    }

    getRequestID() { return this.requestID; }

    getServer() { return this.server; }

    release(ns) {
        let scriptRam = ns.getScriptRam(this.script);

        for (const server of servers) {
            if (this.server == server) {
                server.releaseRam(scriptRam * this.threads);
                return true;
            }
        }

        ns.print("Thread unable to release ram: server ",this.server.getHostname()," not found.");
    }
}

/** @param {NS} ns */
async function addServer(ns, hostname) {
    for (const server of servers) {
        // console.log("Server known to ThreadContoller: ", server.getHostname());
        if (hostname == server.getHostname()) {
            // throw new Error ('Server ' + hostname + ' already exists in servers.');
            ns.print("Server " + hostname + " already listed in available servers.");
            return;
        }
    }

    servers.push(new server(hostname, ns.getServerMaxRam(hostname)));

    for (const server of servers) {
        if (hostname == server.getHostname()) {
            server.allocateRam(ns.getServerUsedRam(hostname));
        }
    }

    ns.print("Server " + hostname + " added to available servers.");
    await ns.sleep(100);
}

/** @param {NS} ns */
function upgradeServer(ns, hostname)
{
    let newMaxRam = ns.getServerMaxRam(hostname);

    for (const server of servers) {
        if (hostname == server.getHostname()) {
            ns.print(hostname + " now has " + ns.formatNumber(newMaxRam) + " available, up from " + ns.formatNumber(server.maxRam));
            server.refreshAvailableRam(newMaxRam);
        }
    }
}

/** @param {NS} ns */
function isAvailableMemorySufficient (ns, script, requiredThreads) {
    let threadCost = ns.getScriptRam(script);
    let allocatableThreads = 0;

    for (const server of servers) {
        let availableRam = server.getRamAvailable();
        if (availableRam >= threadCost) {
            allocatableThreads += Math.floor(availableRam/threadCost);
        }
    }

    return (allocatableThreads >= requiredThreads);
}

/** @param {NS} ns */
function readRequestData (ns) {
    return ns.readPort(1);
}

/** @param {NS} ns */
function writeResponseData (ns, requestID, success) {
    ns.writePort(2, requestID);
    ns.writePort(2, success);
}

/** @param {NS} ns */
function calculateAvailableThreads (ns, hostname, script) {
    let threadCost = ns.getScriptRam(script);
    // ns.print ("Thread cost: " + threadCost);

    for (const server of servers) {
        // ns.print(server.getHostname());

        if (server.getHostname() == hostname) {
            let availableRam = server.getRamAvailable();
            // console.log("Available ram on ",server.getHostname()," is ",availableRam);
            let threadsAvailable = availableRam / threadCost;
            threadsAvailable = Math.floor(threadsAvailable);
            ns.print(hostname," ",script," threads available: " + threadsAvailable);
            return threadsAvailable;
        }
    }

    return 0;
}

/** @param {NS} ns
    @param any[] args */
function allocateMemory (ns, requestID, script, requiredThreads, inputArgs) {
    ns.print("Required threads: " + requiredThreads);

    for (const server of servers) {
        let threadsToAllocate = calculateAvailableThreads(ns, server.getHostname(), script)
        ns.print("Sever " + server.getHostname() + " " + script + " threads available: " + threadsToAllocate);

        if (threadsToAllocate > 0) {
            if (threadsToAllocate > requiredThreads) { threadsToAllocate = requiredThreads; }
            ns.print("Allocating " + threadsToAllocate + " threads on ",server.getHostname());

            ns.scp(script, server.getHostname());

            let args = [script, server.getHostname(), threadsToAllocate];

            for (const arg of inputArgs) {
                args.push(arg);
            }

            let ramCostPerThread = ns.getScriptRam(script);
            server.allocateRam(threadsToAllocate * ramCostPerThread);
            ns.run("util/execute.js", 1, ...args);
            threads.add(new thread(requestID, server, script, threadsToAllocate));
            requiredThreads -= threadsToAllocate;
            if (requiredThreads <= 0) { return true; }
        }
    }

    return false;
}

/** @param {NS} ns */
function releaseMemory (ns, requestID) {
    for (const thread of threads) {
        if (thread.getRequestID() == requestID) {
            ns.print("Releasing thread " + thread.getRequestID() + " on " + thread.getServer().getHostname());
            thread.release(ns);
            threads.delete(thread);
        }
    }
}

/** @param {NS} ns */
function invalidPortData (data) {
    if (data == "NULL PORT DATA") { return true; }
    else { return false; }
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("disableLog");
    ns.disableLog("sleep");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scp");

    let port = ns.getPortHandle(1);
    while (true) {
        while (!port.empty()) {
            let portData = readRequestData(ns);

            if (portData == "add") {
                await addServer(ns, readRequestData(ns));
            }
            else if (portData == "upgrade") {
                upgradeServer(ns, readRequestData(ns));
            }
            else if (portData == "request") {
                let requestID = readRequestData(ns);
                let script = readRequestData(ns);
                let threads = readRequestData(ns);

                if(invalidPortData(threads)) { continue; }

                /** @type {any[]} */
                ns.print("Received request to run ", script," with ",threads," threads. Collecting args.");
                let args = readRequestData(ns);
                if(invalidPortData(args)) { continue; }

                args = JSON.parse(args);
                if (!Array.isArray(args)) { 
                    ns.print("Expected array as args input, received " + typeof(args) + ". Converting to array.");
                    args = new Array(args);
                }

                ns.print("Received request to run ", script," with ",threads," threads. Checking available memory.");

                if (isAvailableMemorySufficient(ns, script, threads)) {
                    allocateMemory(ns, requestID, script, threads, args);
                    writeResponseData(ns, requestID, "true");
                } else {
                    ns.print("Insufficient memory available.");
                    writeResponseData(ns, requestID, "false");
                }
            }
            else if (portData == "release") {
                let requestID = readRequestData(ns);

                releaseMemory(ns, requestID);
                writeResponseData(ns, requestID, "true");
            }
            else if (portData == "reset") {
                ns.print("\n---------------------------------------------------");
                ns.print("Thread Controller was reset. I hope that was intentional!");
                ns.print("---------------------------------------------------\n");
                ns.tprint("ALERT: ThreadController was just reset. If unintentional, please investigate!");
                
                let serverLength = servers.length;
                // console.log("servers.length = ",serverLength);
                
                for (let i = 0; i < serverLength; i++) {
                    let poppedServer = servers.pop();
                    ns.print("Removed ",poppedServer," from server list.");
                }

                threads.clear();
            }
            else if (portData == "analyzeServers") {
                for (const server of servers) {
                    ns.print("Server ",server.getHostname()," has ",ns.formatNumber(server.getRamAvailable())," available of ",ns.formatNumber(server.getMaxRam()));
                }
            }
        }

        await ns.sleep(1);
    }
}