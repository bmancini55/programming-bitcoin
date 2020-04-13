import { ScriptOperation } from "./ScriptOperation";
import { ScriptData } from "./ScriptData";

/**
 * Represents a value in a script. It can be either an operation
 * or data
 */
export type ScriptPart = ScriptOperation | ScriptData;
