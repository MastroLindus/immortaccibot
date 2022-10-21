import fetch from "node-fetch";
import { model } from "./handler.js";

export type TelegramEvent = {
    body: string;
};

export type TelegramMessageEvent = {
    message?: {
        text?: string,
        chat?: Chat
    }
};

export type Chat = { id: string };

export async function sendTextToUser(chat: Chat, text: string) {
    const botToken = model.params.bot_token;
    const chatId = chat.id;
    return fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`)
}