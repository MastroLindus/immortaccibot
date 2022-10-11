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


export function quoteStats(chat: Chat) {
    const sums = quotesJson.reduce<Record<string, number>>((res, curr) => {
        res[curr.author] = (res[curr.author] ?? 0) + 1;
        return res;
    }, {});
    const sortedSums = Object.entries(sums).sort(([, a], [, b]) => b - a).filter(([, a]) => a >= 10);
    const stats = sortedSums.map(([author, value]) => `${author}: ${value}`).join("\n");

    return sendTextToUser(model.params.bot_token, chat.id, `Authors stats (with at least 10 quotes):\n${stats}`);
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