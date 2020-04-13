import { ScriptOperation } from "./ScriptOperation";
import { ScriptElement } from "./ScriptElement";

/**
 * Represents a value in a script. It can be either an operation
 * or data
 */
export type ScriptCmd = ScriptOperation | ScriptElement;
