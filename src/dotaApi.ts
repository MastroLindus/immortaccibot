import { model } from "./handler.js"
import fetch from "node-fetch";
import { Chat, sendTextToUser } from "./telegramApi.js";

type RecentMatch = {
    match_id: number;
    player_slot: number;
    radiant_win: boolean;
    hero_id: number;
    kills: number;
    deaths: number;
    assists: number;
    xp_per_min: number;
    gold_per_min: number;
    hero_damage: number;
    tower_damage: number;
    last_hits: number;
}

function prettyPrint(match: RecentMatch) {
    const side = match.player_slot < 128 ? "radiant" : "dire";
    const result = (side == "radiant" && match.radiant_win) || (side == "dire" && !match.radiant_win) ? "won" : "lost";

    const { kills, deaths, assists, xp_per_min, gold_per_min, hero_damage, tower_damage, last_hits } = match;

    const playerStats = `
    kills: ${kills} deaths: ${deaths} assists: ${assists}
    xp_per_min: ${xp_per_min} gold_per_min: ${gold_per_min} last_hits: ${last_hits}
    hero_damage: ${hero_damage} tower_damage: ${tower_damage}`;

    return `Last match:
    Side: ${side}
    Result: ${result}
    Player stats:
    ${playerStats}
    `;
}


async function getRecentMatches(player: string) {
    const accountsAsEntries = model.params.dota_accounts.split(",").map(a => {
        const splitted = a.split("=");
        return [splitted[0], splitted[1]] as [string, string];
    });

    const accounts = new Map<string, string>(accountsAsEntries);

    const account = accounts.get(player.replace("@", ""));

    if (!account) {
        return;
    }
    const reponse = await fetch(`https://api.opendota.com/api/players/${account}/recentMatches`);
    return await reponse.json() as ReadonlyArray<RecentMatch>;
}


export async function lastMatchHandler(chat: Chat, params?: string) {
    const data = await getRecentMatches(params!);
    if (data) {
        const matchInfo = prettyPrint(data[0]);
        sendTextToUser(chat, matchInfo);
    }
}
