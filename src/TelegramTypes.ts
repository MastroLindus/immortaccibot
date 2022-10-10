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