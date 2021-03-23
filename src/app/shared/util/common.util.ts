import { environment } from 'src/environments/environment';

/**
 * Generates a string in the format of "{name} ({code})".
 * It will gracefully handle if name and/ or code are empty/ undefined
 * @param code
 * @param name
 */
export function generateNameAndCodeString(code: string, name: string): string {
  let nameAndCode = '';

  if (name && !code) {
    nameAndCode = name;
  } else if (name && code) {
    nameAndCode = `${name} (${code})`;
  } else if (!name && code) {
    nameAndCode = code;
  }

  return nameAndCode;
}

/** 10122020 - Gaurav - Central Console Log
 * Added allowConsoleLogs flag to control display of console logs from common.util.ts.
 * This shall prevent any accidental display of consoled information in prod mode */
export enum ConsoleTypes {
  log,
  error,
  warn,
  clear,
  table,
  count,
  dir,
  // time,
  // group
}

export interface ConsoleLogParams {
  consoleType?: ConsoleTypes;
  valuesArr?: any[];
}

/** Developers are encouraged to use this central method instead of arbitrarily calling console.logs  */
export function consoleLog({ consoleType, valuesArr }: ConsoleLogParams): void {
  if (environment?.allowConsoleLogs) {
    switch (consoleType) {
      case ConsoleTypes.error:
        console.error(...(valuesArr ?? ''));
        break;

      case ConsoleTypes.warn:
        console.warn(...(valuesArr ?? ''));
        break;

      case ConsoleTypes.clear:
        console.clear();
        break;

      case ConsoleTypes.table:
        console.table(...(valuesArr ?? ''));
        break;

      case ConsoleTypes.count:
        console.count(...(valuesArr ?? ''));
        break;

      case ConsoleTypes.dir:
        console.dir(...(valuesArr ?? ''));
        break;

      default:
        console.log(...(valuesArr ?? ''));
    }
  }
}
/** 10122020 - Gaurav - Central Console Log - Ends */
