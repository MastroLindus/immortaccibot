import { getAwsParameters } from "./awsParameterStore.js";
import { sendTextToUser } from "./sendTextToUser.js";

type TelegramEvent = {
  body: string;
};

type TelegramMessageEvent = {
  message?: {
    text?: string,
    chat?: Chat
  }
};

type Chat = { id: string };

const parameters = await getAwsParameters();

export const telegrambot = async (event: TelegramEvent) => {
  const body = JSON.parse(event.body) as TelegramMessageEvent;

  if (body?.message?.text && body?.message?.chat) {
    const { chat, text } = body.message;
    await routeRequest(chat, text);
  }

  return { statusCode: 200 };
};

async function pingAll(chatId: string, extra: string = "") {
  const users = parameters.all_users.split(",").map(u => `@${u}`).join(" ")
  if (extra) {
    return sendTextToUser(parameters.bot_token, chatId, `${users} ${extra}`);
  }
  return sendTextToUser(parameters.bot_token, chatId, `${users} adunataaaa`);
}

async function routeRequest(chat: Chat, text: string) {
  if (text.startsWith("/echo")) {
    return sendTextToUser(parameters.bot_token, chat.id, text.substring(6))
  }
  else if (text == "/all") {
    return pingAll(chat.id)
  }
  else if (text.startsWith("/all")) {
    return pingAll(chat.id, text.substring(5))
  }
}
