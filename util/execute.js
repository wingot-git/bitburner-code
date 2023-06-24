/** @param {NS} ns */
export async function main(ns) {
    let scriptName = ns.args[0];
    let server = ns.args[1];
    let threads = ns.args[2];
    let target = ns.alert[3];

    ns.exec(scriptName, server, threads, target);
}