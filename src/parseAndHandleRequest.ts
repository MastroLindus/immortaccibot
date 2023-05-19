import { lastMatchHandler, playerHeroesHandler, wlHandler } from "./dota/dotaHandlers.js";
import { model } from "./handler.js"
import { quotesHandler, quoteStats } from "./quotesHandler.js"

type CommandHandler = (params?: string) => Promise<string | undefined>;

const commandHandlers: Record<string, CommandHandler> = {
    "echo": echo,
    "ciccio": ciccio,
    "all": pingAll,
    "citastats": quoteStats,
    "cita": quotesHandler,
    "dotalast": lastMatchHandler,
    "dotawl": wlHandler,
    "heroes": playerHeroesHandler,
};

async function unknownHandler() {
    // we could return a message to the user that the command is invalid, but ignoring it is probably even better.
}

export async function parseAndHandleRequest(initialText: string) {
    // remove initial slash and in case the bot tag
    const text = initialText.replace("@immortacci_bot", "").substring(1);
    const [prefix, ...params] = text.split(" ");
    const handler = commandHandlers[prefix.toLowerCase()] ?? unknownHandler;
    const paramsString = params.length == 0 ? undefined : params.join(" ");
    return handler(paramsString);
}

async function ciccio() {
    return "culo";
}

async function echo(params?: string) {
    return params ?? "Whassaaapp?";
}

async function pingAll(params?: string) {
    const users = model.params.all_users.split(",").map(u => `@${u}`).join(" ");
    if (params) {
        return `${users} ${params}`;
    }
    return `${users} adunataaaa`;
}

