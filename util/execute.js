/** @param {NS} ns */
export async function main(ns) {
    let scriptName = ns.args[0];
    let server = ns.args[1];
    let threads = ns.args[2];

    let args = [];
    for (let i = 3; i < ns.args.length; i++) {
        args[i-3] = ns.args[i];
    }

    // console.log(scriptName, server, threads, ...args);
    let PID = ns.exec(scriptName, server, threads, ...args);
/*     if (PID == 0) {
        console.log("Execute failed to ns.exec " + scriptName, server, threads, args + ". ?too many threads.");
    } else {
        console.log("Execute succeeded to ns.exec " + scriptName, server, threads, args + ", generating PID: " + PID);
    } */
    ns.sleep(10000);
}