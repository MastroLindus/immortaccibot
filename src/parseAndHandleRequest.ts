import { listTables } from "./aws/dynamoStore.js";
import { lastMatchHandler, playerHeroesHandler, wlHandler } from "./dota/dotaHandlers.js";
import { echo, ciccio, pingAll, unknownHandler } from "./genericHandlers.js";
import { quotesHandler, quoteStats } from "./quotesHandler.js";

type CommandHandler = (params?: string) => Promise<string | undefined>;

const commandHandlers: Record<string, CommandHandler> = {
    echo: echo,
    ciccio: ciccio,
    all: pingAll,
    citastats: quoteStats,
    cita: quotesHandler,
    dotalast: lastMatchHandler,
    dotawl: wlHandler,
    heroes: playerHeroesHandler,
    listTables: listTables,
};

export async function parseAndHandleRequest(initialText: string) {
    // remove initial slash and in case the bot tag
    const text = initialText.replace("@immortacci_bot", "").substring(1);
    const [prefix, ...params] = text.split(" ");
    const handler = commandHandlers[prefix.toLowerCase()] ?? unknownHandler;
    console.log(`prefix ${prefix}`);
    console.log(handler);
    const paramsString = params.length == 0 ? undefined : params.join(" ");
    return handler(paramsString);
}
