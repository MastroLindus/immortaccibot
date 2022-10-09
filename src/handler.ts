import rp from "request-promise";
import AWS from "aws-sdk";
import { Parameter } from "aws-sdk/clients/ssm";
const SSM = new AWS.SSM();

type ParameterNames = "all_users" | "bot_token";
type TelegramMessageEvent = {
  message?: {
    text?: string,
    chat?: { id: string }
  }
};

type TelegramEvent = {
  body: string;
};

async function getParametersFromStore() {
  const params = {
    Names: ['all_users', 'bot_token'],/* required */
    WithDecryption: true
  };
  const defaultParams = { "all_users": "", "bot_token": "" };
  const request = await SSM.getParameters(params).promise();

  return request?.Parameters?.reduce<Record<ParameterNames, string>>((result: Record<ParameterNames, string>, k: Parameter) =>
    ({ ...result, [k.Name!]: k.Value }), defaultParams) ?? defaultParams;
}

export const telegrambot = async (event: TelegramEvent) => {
  const parameters = await getParametersFromStore();


  async function sendToUser(chat_id: string, text: string) {
    const options = {
      method: 'GET',
      uri: `https://api.telegram.org/bot${parameters.bot_token}/sendMessage`,
      qs: {
        chat_id,
        text
      }
    };

    return rp(options);
  }

  async function pingAll(chat_id: string, extra: string = "") {
    const users = parameters.all_users.split(",").map(u => `@${u}`).join(" ")
    if (extra) {
      return sendToUser(chat_id, `${users} ${extra}`);
    }
    return sendToUser(chat_id, `${users} adunataaaa`);
  }


  const body = JSON.parse(event.body) as TelegramMessageEvent;

  if (body?.message?.text && body?.message?.chat) {
    const { chat, text } = body.message;

    if (text.startsWith("/echo")) {
      await sendToUser(chat.id, text.substring(6))
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