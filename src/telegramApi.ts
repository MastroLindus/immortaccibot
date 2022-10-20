import rp from "request-promise";

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

export async function sendTextToUser(botToken: string, chatId: string, text: string) {
    const options = {
        method: 'GET',
        uri: `https://api.telegram.org/bot${botToken}/sendMessage`,
        qs: {
            chat_id: chatId,
            text
        }
    };

    return rp(options);
}