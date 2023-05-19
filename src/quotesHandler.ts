import quotesJson from "../resources/quotes.json" assert { type: 'json' };

type Quote = typeof quotesJson[number];

function pickRandomQuote(quotes: ReadonlyArray<Quote>): Quote {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function quoteToString(q: Quote): string {
    return `${q.author}: "${q.quote}"\n${q.timestamp}`;
}


export async function quoteStats() {
    const sums = quotesJson.reduce<Record<string, number>>((res, curr) => {
        res[curr.author.toLowerCase()] = (res[curr.author.toLowerCase()] ?? 0) + 1;
        return res;
    }, {});
    const sortedSums = Object.entries(sums).sort(([, a], [, b]) => b - a).filter(([, a]) => a >= 10);
    const stats = sortedSums.map(([author, value]) => `${author}: ${value}`).join("\n");

    return `Authors stats (with at least 10 quotes):\n${stats}`;
}

export async function quotesHandler(author?: string) {
    if (!author) {
        return quoteToString(pickRandomQuote(quotesJson));
    }

    const authorQuotes = quotesJson.filter(q => q.author.toLowerCase() === author.toLowerCase());
    if (authorQuotes.length > 0) {
        return quoteToString(pickRandomQuote(authorQuotes));
    }
    return `No quotes found for ${author}`;
}