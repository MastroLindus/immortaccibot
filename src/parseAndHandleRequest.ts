import { lastMatchHandler, playerHeroesHandler, wlHandler } from "./dota/dotaHandlers.js";
import { echo, ciccio, pingAll, unknownHandler } from "./genericHandlers.js";
import { joinLobbyHandler, getLobbyHandler } from "./model/lobbies.js";
import { quotesHandler, quoteStats } from "./quotesHandler.js";

type CommandHandler = (user_id: string, params?: string) => Promise<string | undefined>;

// keys in LOWER CASE
const commandHandlers: Record<string, CommandHandler> = {
    echo: echo,
    ciccio: ciccio,
    all: pingAll,
    citastats: quoteStats,
    cita: quotesHandler,
    dotalast: lastMatchHandler,
    dotawl: wlHandler,
    heroes: playerHeroesHandler,
    lobby: getLobbyHandler,
    join: joinLobbyHandler,
};

export async function parseAndHandleRequest(user_id: string, initialText: string) {
    // remove initial slash and in case the bot tag
    const text = initialText.replace("@immortacci_bot", "").substring(1);
    const [prefix, ...params] = text.split(" ");
    const handler = commandHandlers[prefix.toLowerCase()] ?? unknownHandler;
    const paramsString = params.length == 0 ? undefined : params.join(" ");
    return handler(user_id, paramsString);
}
