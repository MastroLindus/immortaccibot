import { debug } from "./logging.js";
import { isOffline } from "./model.js";
import { parseAndHandleRequest } from "./parseAndHandleRequest.js";
import fetch from "node-fetch";

type TelegramEvent = {
    body: string;
};

type TelegramMessageEvent = {
    message?: {
        text?: string;
        chat?: { id: string };
    };
};

export const telegrambot = async (event: TelegramEvent) => {
    const body = JSON.parse(event.body) as TelegramMessageEvent;
    debug("Received request from telegram: ", body);
    let returnMessage;

    if (body?.message?.text && body?.message?.chat) {
        const { chat, text } = body.message;
        returnMessage = await parseAndHandleRequest(text);
        if (returnMessage && !isOffline) {
            await sendTextToUser(chat.id, returnMessage);
        }
    }

    if (isOffline) {
        console.log(`Response: ${returnMessage}`);
        return returnMessage || "NO RETURN MESSAGE";
    }

    return { statusCode: 200 };
};

async function sendTextToUser(chatId: string, text: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
        return fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
                text
            )}`
        );
    }
    console.log("bot token not found in env variable");
}
