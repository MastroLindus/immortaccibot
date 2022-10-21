import { lastMatchHandler, wlHandler } from "./dotaApi.js";
import { model } from "./handler.js"
import { quotesHandler, quoteStats } from "./quotesHandler.js"
import { sendTextToUser, Chat } from "./telegramApi.js"

type CommandHandler = (chat: Chat, params?: string) => Promise<unknown>;

const commandHandlers: Record<string, CommandHandler> = {
    "echo": echo,
    "ciccio": ciccio,
    "all": pingAll,
    "citastats": quoteStats,
    "cita": quotesHandler,
    "dotaLast": lastMatchHandler,
    "dotaWl": wlHandler
};

async function unknownHandler() {
    // we could return a message to the user that the command is invalid, but ignoring it is probably even better.
}

export async function parseAndHandleRequest(chat: Chat, initialText: string) {
    // remove initial slash and in case the bot tag
    const text = initialText.replace("@immortacci_bot", "").substring(1);
    const [prefix, ...params] = text.split(" ");
    const handler = commandHandlers[prefix] ?? unknownHandler;
    return handler(chat, params?.join(" "));
}

async function ciccio(chat: Chat) {
    return sendTextToUser(chat, "culo");
}

async function echo(chat: Chat, params?: string) {
    return sendTextToUser(chat, params ?? "Whassaaapp?");
}

async function pingAll(chat: Chat, params?: string) {
    const users = model.params.all_users.split(",").map(u => `@${u}`).join(" ");
    if (params) {
        return sendTextToUser(chat, `${users} ${params}`);
    }
    return sendTextToUser(chat, `${users} adunataaaa`);
}

