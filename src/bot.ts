import { dotaApi, nullDotaApi } from "./dota/dotaApi.js";
import { getParameters, nullParams } from "./getParameters.js";
import { parseAndHandleRequest } from "./parseAndHandleRequest.js";
import fetch from "node-fetch";

export const model = {
    params: nullParams,
    dotaApi: nullDotaApi,
    _fetched: false,
    isOffline: process.env.IS_OFFLINE,
};

export const options = {
    aws: {
        region: "eu-west-1"
    }
};

async function fetchModelIfNeeded() {
    if (!model._fetched) {
        model.params = await getParameters();
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
    let returnMessage;

    if (body?.message?.text && body?.message?.chat) {
        const { chat, text } = body.message;
        returnMessage = await parseAndHandleRequest(text);
        if (returnMessage) {
            await sendTextToUser(chat.id, returnMessage);
        }
    }

    if (model.isOffline) {
        return returnMessage || "NO RETURN MESSAGE";
    }

    return { statusCode: 200 };
};

async function sendTextToUser(chatId: string, text: string) {
    const botToken = model.params.bot_token;

    if (model.isOffline) {
        console.log(`Chat ${chatId}: ${text}`);
        return;
    }
    return fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
            text
        )}`
    );
}
