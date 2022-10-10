import { getAwsParametersFromStore } from "./getAwsParametersFromStore.js";
import { parseAndHandleRequest } from "./parseAndHandleRequest.js";
import { TelegramEvent, TelegramMessageEvent } from "./TelegramTypes.js";

export const model = {
  params: await getAwsParametersFromStore()
};

export const telegrambot = async (event: TelegramEvent) => {
  const body = JSON.parse(event.body) as TelegramMessageEvent;

  if (body?.message?.text && body?.message?.chat) {
    const { chat, text } = body.message;
    await parseAndHandleRequest(chat, text);
  }

  return { statusCode: 200 };
};

