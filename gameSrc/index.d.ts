import { NS as OriginalNS } from "../gameSrc/src/ScriptEditor/NetscriptDefinitions";
export * from "../gameSrc/src/ScriptEditor/NetscriptDefinitions";

interface Heart {
  /**
   * Get Player's current Karma
   * @remarks
   * RAM cost: 0 GB
   *
   * @returns current karma.
   */
  break(): number;
}
export interface NS extends OriginalNS {
  readonly heart: Heart;
}