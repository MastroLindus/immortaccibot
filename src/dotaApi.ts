import { model } from "./handler.js"
import heroJson from "../resources/dotaHeroes.json" assert { type: 'json' };
import fetch from "node-fetch";
import { Chat, sendTextToUser } from "./telegramApi.js";
import { extractUserFromParams } from "./utils.js";

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

type WinLose = {
    win: number; lose: number;
}

type DotaHero = typeof heroJson[number];

function prettyPrint(match: RecentMatch) {
    const side = match.player_slot < 128 ? "radiant" : "dire";
    const result = (side == "radiant" && match.radiant_win) || (side == "dire" && !match.radiant_win) ? "won" : "lost";

    const { kills, deaths, assists, xp_per_min, gold_per_min, hero_damage, tower_damage, last_hits } = match;
    const hero = heroJson.find(h => h.id == match.hero_id);
    const playerStats = ``;

    return `Last match:
        Hero: ${hero?.localized_name}
        Side: ${side}
        Result: ${result}
        Player stats:
            kills: ${kills} deaths: ${deaths} assists: ${assists}
            xp_per_min: ${xp_per_min} gold_per_min: ${gold_per_min} last_hits: ${last_hits}
            hero_damage: ${hero_damage} tower_damage: ${tower_damage}
    `;
}

function prettyPrintWl(wl: WinLose) {
    const rate = wl.win == 0 && wl.lose == 0 ? 0 : wl.win / (wl.win + wl.lose) * 100;
    const truncatedRate = Math.trunc(rate * 100) / 100;
    return `
    Match won: ${wl.win}
    Match lost: ${wl.lose}
    Win rate: ${truncatedRate}%`;
}

function getDotaAccount(player: string) {
    const accountsAsEntries = model.params.dota_accounts.toLowerCase().split(",").map(a => {
        const splitted = a.split("=");
        return [splitted[0], splitted[1]] as [string, string];
    });

    const accounts = new Map<string, string>(accountsAsEntries);

    return accounts.get(player.toLowerCase().replace("@", ""));
}


async function getRecentMatches(player: string) {
    const account = getDotaAccount(player)
    if (!account) {
        return;
    }
    const reponse = await fetch(`https://api.opendota.com/api/players/${account}/recentMatches`);
    return await reponse.json() as ReadonlyArray<RecentMatch>;
}

async function getWl(player: string, limit?: number) {
    const account = getDotaAccount(player)
    if (!account) {
        return;
    }
    const limitQuery = limit && Number.isInteger(limit) ? `?limit=${limit}` : "";
    const reponse = await fetch(`https://api.opendota.com/api/players/${account}/wl${limitQuery}`);
    return await reponse.json() as WinLose;
}


export async function lastMatchHandler(chat: Chat, params?: string) {
    const data = await getRecentMatches(params!);
    if (data) {
        const matchInfo = prettyPrint(data[0]);
        return sendTextToUser(chat, matchInfo);
    }
}

export async function wlHandler(chat: Chat, params?: string) {
    const paramsInfo = extractUserFromParams(params);
    if (paramsInfo) {
        const maybeNumber = Number(paramsInfo.params);
        const wlInfo = await getWl(paramsInfo.user, maybeNumber);
        if (wlInfo) {
            return sendTextToUser(chat, prettyPrintWl(wlInfo));
        }
    }
}
