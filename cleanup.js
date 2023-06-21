/** @param {NS} ns */
export async function main(ns) {
    ns.ls("home", "gameSrc").forEach(file=> ns.rm(file));
}