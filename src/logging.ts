import { settings } from "./settings.js";

const logLevelToInt = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

export type LogLevel = keyof typeof logLevelToInt;

const minLogLevel = logLevelToInt[settings.logging as LogLevel] ?? 1;

export function log(level: LogLevel, message: string, ...optionalParams: unknown[]) {
    const messageLevel = logLevelToInt[level];
    if (messageLevel >= minLogLevel) {
        console.log(`${level.toUpperCase()}: ${message}`, ...optionalParams);
    }
}

export function error(message: string, ...optionalParams: unknown[]) {
    log("error", message, ...optionalParams);
}

export function info(message: string, ...optionalParams: unknown[]) {
    log("info", message, ...optionalParams);
}

export function debug(message: string, ...optionalParams: unknown[]) {
    log("debug", message, ...optionalParams);
}

export function warn(message: string, ...optionalParams: unknown[]) {
    log("warn", message, ...optionalParams);
}
