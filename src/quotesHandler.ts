import quotesJson from "../resources/quotes.json" assert { type: 'json' };
import { model } from "./handler.js";
import { sendTextToUser, Chat } from "./telegramApi.js";

type Quote = typeof quotesJson[number];

function pickRandomQuote(quotes: ReadonlyArray<Quote>): Quote {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function quoteToString(q: Quote): string {
    return `${q.author}: "${q.quote}"\n${q.timestamp}`;
}


export function quoteStats(chat: Chat) {
    const sums = quotesJson.reduce<Record<string, number>>((res, curr) => {
        res[curr.author.toLowerCase()] = (res[curr.author.toLowerCase()] ?? 0) + 1;
        return res;
    }, {});
    const sortedSums = Object.entries(sums).sort(([, a], [, b]) => b - a).filter(([, a]) => a >= 10);
    const stats = sortedSums.map(([author, value]) => `${author}: ${value}`).join("\n");

    return sendTextToUser(chat, `Authors stats (with at least 10 quotes):\n${stats}`);
}

export function quotesHandler(chat: Chat, author?: string) {
    if (!author) {
        return sendTextToUser(chat, quoteToString(pickRandomQuote(quotesJson)));
    }

    const authorQuotes = quotesJson.filter(q => q.author.toLowerCase() === author.toLowerCase());
    if (authorQuotes.length > 0) {
        return sendTextToUser(chat, quoteToString(pickRandomQuote(authorQuotes)));
    }
    return sendTextToUser(chat, `No quotes found for ${author}`);
}