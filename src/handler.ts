import { dotaApi, nullDotaApi } from "./dota/dotaApi.js";
import { getAwsParametersFromStore, nullParams } from "./getAwsParametersFromStore.js";
import { parseAndHandleRequest } from "./parseAndHandleRequest.js";
import fetch from "node-fetch";

export const model = {
    params: nullParams,
    dotaApi: nullDotaApi,
    _fetched: false,
};

async function fetchModelIfNeeded() {
    if (!model._fetched) {
        model.params = await getAwsParametersFromStore();
        model.dotaApi = dotaApi();
        model._fetched = true;
    }
}

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
    await fetchModelIfNeeded();
    const body = JSON.parse(event.body) as TelegramMessageEvent;

    if (body?.message?.text && body?.message?.chat) {
        const { chat, text } = body.message;
        const returnMessage = await parseAndHandleRequest(text);
        if (returnMessage) {
            const botToken = model.params.bot_token;
            await sendTextToUser(chat.id, botToken, returnMessage);
        }
    }

    return { statusCode: 200 };
};

async function sendTextToUser(chatId: string, botToken: string, text: string) {
    return fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
            text
        )}`
    );
}
