import rp from "request-promise";

export async function sendTextToUser(botToken: string, chatId: string, text: string) {
    const options = {
        method: 'GET',
        uri: `https://api.telegram.org/bot${botToken}/sendMessage`,
        qs: {
            chatId,
            text
        }
    };

    return rp(options);
}