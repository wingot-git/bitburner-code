function printInfo() {
    //ns.print(`\n   *** GANG REPORT ***`);
    const myGang = ns.gang.getGangInformation();
    ns.gang.getBonusTime() > 5000 ? ns.print(art("***BONUS TIME***", { color: 226 })) : ns.print(" ");
    ns.gang.getBonusTime() > 5000 ? ns.print(`Bonus Time:       ${art(dhms(ns.gang.getBonusTime() / 25).padStart(29, " "), { color: 255 })}`) : null;
    ns.print(`Faction name:       ${art(myGang.faction.padStart(27, " "), { color: 255 })}`);
    ns.print(`Faction Rep:        ${art(format(ns.singularity.getFactionRep(myGang.faction)).padStart(27, " "), { color: 255 })}`);
    ns.print(`Total Respect:      ${art(format(myGang.respect).padStart(27, " "), { color: 255 })}`);
    if (getRespectNeededToRecruitMember(ns.gang.getMemberNames()) > 0) {
        ns.print(`New Member at:      ${art((format(getRespectNeededToRecruitMember(ns.gang.getMemberNames())) + " resp").padStart(27, " "), { color: 255 })}`);
    }
    const discountColor = getDiscount() > discountThresh ? 10 : getDiscount() > 0.2 ? 255 : 196
    ns.print(`Equip Discount:     ${art(("-" + formatPercent(getDiscount(), 2)).padStart(27, " "), { color: discountColor })}`);
    ns.print(`Wanted Level:       ${art(format(myGang.wantedLevel).padStart(27, " "), { color: 255 })}`);
    const wantedPenColor = 1 - myGang.wantedPenalty < wantedPenThresh ? 10 : 1 - myGang.wantedPenalty < 0.5 ? 255 : 196
    ns.print(`Wanted Penalty:     ${art(("-" + formatPercent(1 - myGang.wantedPenalty, 2)).padStart(27, " "), { color: wantedPenColor })}`);
    ns.print(`Money gain rate:    ${art((format(myGang.moneyGainRate * 5) + " /s").padStart(27, " "), { color: 255 })}`);
    ns.print(`Is war allowed?:    ${art((myGang.territoryWarfareEngaged).toString().padStart(27, " "), { color: 255 })}`);
    ns.print(`Territory Power:    ${art(format(myGang.power).padStart(27, " "), { color: 255 })}`);
    ns.print(`Min Win Chance:   ${bar(lowestClashChance(), "⚡", 20)}${art(formatPercent(lowestClashChance()).padStart(7, " "), { color: 255 })}`);
    ns.print(`Territory Owned:  ${bar(myGang.territory, "⚡", 20)}${art(formatPercent(myGang.territory).padStart(7, " "), { color: 255 })}`);
}

/** @param {NS} ns */
export async function main(ns) {
    // Gang Monitoring
    while (true) {
		const titles = ["🏴‍☠️💰💰( -_•)╦̵̵̿╤─💥 --- ----- --👮🏼‍♂️", "🏴‍☠️💰💰( -_•)╦̵̵̿╤─💥 ----- ----- 👮🏼‍♂️🩸", "🏴‍☠️💰💰( -_•)╦̵̵̿╤─💥 - ------ ---👮🏼‍♂️🩸"];
		ns.setTitle(tem(titles[tCount], { color: "rgb(0,255,0)", "font-family": 'Brush Script MT, cursive' }));
		tCount++; tCount >= titles.length ? tCount = 0 : null; ns.clearLog();
		if (ns.gang.inGang()) {
			if (ns.args[1] === "metric") metricCheck(ns);
			gangMemberAscension();
			const purchaseAllowed = ns.getBitNodeMultipliers().GangSoftcap > 0.8 || ns.args[0] === true // softcap over ride, call script with true as first args
			if (purchaseAllowed && ns.args[0] !== false) equipmentcheck();
			else if (getDiscount() > 0.5 && ns.args[0] !== false) equipmentcheck(); // try to buy equipment if discount is good enough

			ns.gang.getGangInformation().territory < 1 ? tickCheck() : tick.tw = false;
			if (ns.gang.getGangInformation().territory >= 1) ns.gang.setTerritoryWarfare(false);
			if (!tick.tw) gangMemberStuff();
			printInfo();
		} else {
			ns.print(`Current Karma: ${format(ns.heart.break())}`);
			ns.singularity.joinFaction(faction);
			ns.gang.createGang(faction);
		}
		await ns.sleep(100);
	}    
}