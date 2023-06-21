import { NS } from "NetscriptDefinitions";
// import { NS as OriginalNS } from "gameSrc/src/ScriptEditor/NetscriptDefinitions";
export * from "NetscriptDefinitions";

declare global { const NS: NS; }

/*
interface Heart {
   //
   // Get Player's current Karma
   // @remarks
   // RAM cost: 0 GB
   //
   // @returns current karma.
   //
  break(): number;
}

export interface NS extends OriginalNS {
  readonly heart: Heart;
}
*/