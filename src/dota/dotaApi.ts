import fetch from "node-fetch";
import { User, getUsers } from "../model.js";

const baseUrl = "https://api.opendota.com/api";

export type RecentMatch = {
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
};

export type WinLose = {
    win: number;
    lose: number;
};

export type Match = {
    match_id: number;
    dire_score: number;
    duration: number;
    human_players: number;
    match_seq_num: number;
    radiant_score: number;
    radiant_win: boolean;
    start_time: number;
    players: ReadonlyArray<MatchPlayerInfo>;
};

export type MatchPlayerInfo = {
    match_id: number;
    player_slot: number;
    account_id: number;
    assists: number;
    deaths: number;
    denies: number;
    gold_per_min: number;
    hero_damage: number;
    hero_healing: number;
    hero_id: number;
    kills: number;
    last_hits: number;
    level: number;
    net_worth: number;
    xp_per_min: number;
    personaname: string;
    tower_damage: number;
    win: number;
    lose: number;
};

export type PlayerHero = {
    hero_id: number;
    last_played: number;
    games: number;
    win: number;
    with_games: number;
    with_win: number;
    against_games: number;
    against_win: number;
};

async function getPlayerResponse<R>(url: string, user: User) {
    if (!user.dota_account) {
        return;
    }
    return getResponse<R>(`players/${user.dota_account}/${url}`);
}

async function getResponse<R>(url: string) {
    const response = await fetch(`${baseUrl}/${url}`);
    if (response) {
        return response.json() as R;
    }
}

export const dotaApi = {
    getRecentMatches: async (user: User) =>
        getPlayerResponse<ReadonlyArray<RecentMatch>>("recentMatches", user),
    getPlayerHeroes: async (user: User, heroId?: number) => {
        const heroQuery = heroId && !isNaN(heroId) ? `?hero_id=${heroId}` : "";
        return getPlayerResponse<ReadonlyArray<PlayerHero>>(`heroes${heroQuery}`, user);
    },
    getWl: async (user: User, limit?: number) => {
        const limitQuery = limit && Number.isInteger(limit) ? `?limit=${limit}` : "";
        return getPlayerResponse<WinLose>(`wl${limitQuery}`, user);
    },
    getMatch: async (matchId: number) => getResponse<Match>(`matches/${matchId}`),
};
