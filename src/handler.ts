import AWS from "aws-sdk";
import { Parameter } from "aws-sdk/clients/ssm";

const SSM = new AWS.SSM();

export type ParameterNames = "all_users" | "bot_token";

export async function getParametersFromStore(): Promise<Record<ParameterNames, string>> {
  const params = {
    Names: ['all_users', 'bot_token'],/* required */
    WithDecryption: true
  };
  const defaultParams = { "all_users": "", "bot_token": "" };
  const request = await SSM.getParameters(params).promise();

  return request?.Parameters?.reduce<Record<ParameterNames, string>>((result: Record<ParameterNames, string>, k: Parameter) =>
    ({ ...result, [k.Name!]: k.Value }), defaultParams) ?? defaultParams;
}

import rp from "request-promise";

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

type TelegramMessageEvent = {
  message?: {
    text?: string,
    chat?: { id: string }
  }
};

type TelegramEvent = {
  body: string;
};

export const telegrambot = async (event: TelegramEvent) => {
  const parameters = await getParametersFromStore();

  async function pingAll(chatId: string, extra: string = "") {
    const users = parameters.all_users.split(",").map(u => `@${u}`).join(" ")
    if (extra) {
      return sendTextToUser(parameters.bot_token, chatId, `${users} ${extra}`);
    }
    return sendTextToUser(parameters.bot_token, chatId, `${users} adunataaaa`);
  }


  const body = JSON.parse(event.body) as TelegramMessageEvent;

  if (body?.message?.text && body?.message?.chat) {
    const { chat, text } = body.message;

    if (text.startsWith("/echo")) {
      await sendTextToUser(parameters.bot_token, chat.id, text.substring(6))
    }
    else if (text == "/all") {
      await pingAll(chat.id)
    }
    else if (text.startsWith("/all")) {
      await pingAll(chat.id, text.substring(5))
    }
  }
  return { statusCode: 200 };
};