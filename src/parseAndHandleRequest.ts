import { model } from "./handler.js"
import { sendTextToUser } from "./sendTextToUser.js"
import { Chat } from "./TelegramTypes.js"

export async function parseAndHandleRequest(chat: Chat, text: string) {
    if (text.startsWith("/echo")) {
        return sendTextToUser(model.params.bot_token, chat.id, text.substring(6))
    }
    else if (text == "ciccio") {
        return sendTextToUser(model.params.bot_token, chat.id, "culo")
    }
    else if (text == "/all") {
        return pingAll(chat.id)
    }
    else if (text.startsWith("/all")) {
        return pingAll(chat.id, text.substring(5))
    }
}

async function pingAll(chatId: string, extra: string = "") {
    const users = model.params.all_users.split(",").map(u => `@${u}`).join(" ")
    if (extra) {
        return sendTextToUser(model.params.bot_token, chatId, `${users} ${extra}`);
    }
    return sendTextToUser(model.params.bot_token, chatId, `${users} adunataaaa`);
}

