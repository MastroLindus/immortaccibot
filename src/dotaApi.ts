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

function prettyPrintMatchPlayerInfo(player: MatchPlayerInfo) {
    const hero = heroJson.find(h => h.id == player.hero_id);
    const { kills, deaths, assists, net_worth } = player;
    const kda = `${kills}/${deaths}/${assists}`;
    return `${hero?.localized_name} (${player.personaname ?? "Unknown"}) - kda: ${kda} NW ${net_worth}`;
}

function prettyPrintPlayerHero(heroData: PlayerHero) {
    const hero = heroJson.find(h => h.id == heroData.hero_id);
    const { games, win } = heroData;
    const rate = win == 0 || games == 0 ? 0 : win / (games) * 100;
    const truncatedRate = Math.trunc(rate * 100) / 100;
    return `${hero?.localized_name} wins: ${win} games: ${games} w/r ${truncatedRate}`;
}

function prettyPrintPlayerHeroes(data: ReadonlyArray<PlayerHero>, limit=7) {
    return data.slice(0, limit).map(prettyPrintPlayerHero).join("\n");
}

function prettyPrint(match: Match) {
    const radiantPlayers = match.players.filter(p => p.player_slot < 128);
    const direPlayers = match.players.filter(p => p.player_slot >= 128);

    const rPlayersPrinted = radiantPlayers.map(prettyPrintMatchPlayerInfo).join("\n");
    const dPlayersPrinted = direPlayers.map(prettyPrintMatchPlayerInfo).join("\n");
    const durationMin = Math.floor(match.duration / 60);
    const durationSec = match.duration - durationMin * 60;

    return `Match ${match.match_id} ${new Date(match.start_time * 1000)}:
Duration: ${durationMin}:${durationSec}
    
Radiant:
Score: ${match.radiant_score}
Won: ${match.radiant_win}
Players: 
${rPlayersPrinted}
    
Dire:
Score: ${match.dire_score}
Won: ${!match.radiant_win}
Players: 
${dPlayersPrinted}
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

async function getPlayerHeroes(player: string, heroId ?: number) {
    const account = getDotaAccount(player)
    if (!account) {
        return;
    }
    const heroQuery = heroId && !isNaN(heroId) ? `?hero_id=${heroId}` : "";
    const reponse = await fetch(`https://api.opendota.com/api/players/${account}/heroes${heroQuery}`);
    return await reponse.json() as ReadonlyArray<PlayerHero>;
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

async function getMatch(matchId: number) {
    const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
    return await response.json() as Match;
}


export async function lastMatchHandler(chat: Chat, params?: string) {
    const data = await getRecentMatches(params!);
    if (data) {
        const matchInfo = await getMatch(data[0].match_id);
        if (matchInfo) {
            return sendTextToUser(chat, prettyPrint(matchInfo));
        }
        return sendTextToUser(chat, "match not found");
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

function getHeroIdFromName(name: string) {
    const hero = heroJson.find(h => h.localized_name.toLocaleLowerCase() == name.toLocaleLowerCase())
    return hero?.id;
}

export async function playerHeroesHandler(chat: Chat, params?: string) {
    const paramsInfo = extractUserFromParams(params);
    if (paramsInfo) {
        const maybeHero = paramsInfo.params;
        const heroId = getHeroIdFromName(maybeHero);
        const playersHeroesInfo = await getPlayerHeroes(paramsInfo.user, heroId);
        if (playersHeroesInfo) {
            return sendTextToUser(chat, prettyPrintPlayerHeroes(playersHeroesInfo, heroId !== undefined ? 1 : undefined));
        }
    }
}

type Match = {
    match_id: number,
    dire_score: number,
    duration: number,
    human_players: number,
    match_seq_num: number,
    radiant_score: number,
    radiant_win: boolean,
    start_time: number,
    players: ReadonlyArray<MatchPlayerInfo>
};

type MatchPlayerInfo = {
    match_id: number,
    player_slot: number,
    account_id: number,
    assists: number,
    deaths: number,
    denies: number,
    gold_per_min: number,
    hero_damage: number,
    hero_healing: number,
    hero_id: number,
    kills: number,
    last_hits: number,
    level: number,
    net_worth: number,
    xp_per_min: number,
    personaname: string,
    tower_damage: number,
    win: number,
    lose: number
};

type PlayerHero = {
    hero_id: number,
    last_played: number,
    games: number,
    win: number,
    with_games: number,
    with_win: number,
    against_games: number,
    against_win: number
};
