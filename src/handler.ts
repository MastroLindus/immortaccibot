import { getParametersFromStore } from "./awsParameterStore";
import { sendTextToUser } from "./sendTextToUser";

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