import { debug } from "./logging.js";
import { parseAndHandleRequest } from "./parseAndHandleRequest.js";
import fetch from "node-fetch";
import { settings } from "./settings.js";

type TelegramEvent = {
    body: string;
};

type TelegramMessageEvent = {
    message?: {
        text?: string;
        chat?: { id: string };
        from?: {
            username?: string;
        };
    };
};

export const telegrambot = async (event: TelegramEvent) => {
    const body = JSON.parse(event.body) as TelegramMessageEvent;
    debug("Received request from telegram: ", body);
    let returnMessage;

    if (body?.message?.text && body?.message?.chat && body?.message?.from?.username) {
        const { chat, text, from } = body.message;
        returnMessage = await parseAndHandleRequest(from.username!, text);
        if (returnMessage && !settings.isOffline) {
            await sendTextToUser(chat.id, returnMessage);
        }
    }

    if (settings.isOffline) {
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
                text,
            )}`,
        );
    }
    console.log("bot token not found in env variable");
}
