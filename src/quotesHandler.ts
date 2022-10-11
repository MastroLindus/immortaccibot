import quotesJson from "../resources/quotes.json" assert { type: 'json' };
import { model } from "./handler.js";
import { sendTextToUser } from "./sendTextToUser.js";
import { Chat } from "./TelegramTypes.js";

type Quote = typeof quotesJson[number];

function pickRandomQuote(quotes: ReadonlyArray<Quote>): Quote {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function quoteToString(q: Quote): string {
    return `${q.author}: "${q.quote}"\n${q.timestamp}`;
}

export function quotesHandler(chat: Chat, author?: string) {
    if (!author) {
        return sendTextToUser(model.params.bot_token, chat.id, quoteToString(pickRandomQuote(quotesJson)));
    }

    const authorQuotes = quotesJson.filter(q => q.author.toLowerCase() === author.toLowerCase());
    if (authorQuotes.length > 0) {
        return sendTextToUser(model.params.bot_token, chat.id, quoteToString(pickRandomQuote(authorQuotes)));
    }
    return sendTextToUser(model.params.bot_token, chat.id, `No quotes found for ${author}`);
}