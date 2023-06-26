/** @param {NS} ns */
export async function main(ns) {
  let requestPort =ns.getPortHandle(1);
  requestPort.clear();
  requestPort.tryWrite("reset");

  let responsePort =ns.getPortHandle(2);
  responsePort.clear();
}