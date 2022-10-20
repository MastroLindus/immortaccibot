import { model } from "./handler.js"
import { quotesHandler, quoteStats } from "./quotesHandler.js"
import { sendTextToUser, Chat } from "./telegramApi.js"

type CommandHandler = (chat: Chat, params?: string) => Promise<unknown>;

const commandHandlers: Record<string, CommandHandler> = {
    "echo": echo,
    "ciccio": ciccio,
    "all": pingAll,
    "citastats": quoteStats,
    "cita": quotesHandler
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
    return sendTextToUser(model.params.bot_token, chat.id, "culo");
}

async function echo(chat: Chat, params?: string) {
    return sendTextToUser(model.params.bot_token, chat.id, params ?? "whassaaappp");
}

async function pingAll(chat: Chat, params?: string) {
    const chatId = chat.id;
    const users = model.params.all_users.split(",").map(u => `@${u}`).join(" ");
    if (params) {
        return sendTextToUser(model.params.bot_token, chatId, `${users} ${params}`);
    }
    return sendTextToUser(model.params.bot_token, chatId, `${users} adunataaaa`);
}

