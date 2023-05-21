import fetch from "node-fetch";
import { model } from "../model.js";

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

function getDotaAccount(player: string) {
    const accountsAsEntries = model.params.dota_accounts
        .toLowerCase()
        .split(",")
        .map((a) => {
            const splitted = a.split("=");
            return [splitted[0], splitted[1]] as [string, string];
        });

    const accounts = new Map<string, string>(accountsAsEntries);

    return accounts.get(player.toLowerCase().replace("@", ""));
}

export function dotaApi(baseUrl = "https://api.opendota.com/api"): DotaApi {
    async function getPlayerResponse<R>(url: string, player: string) {
        const account = getDotaAccount(player);
        if (!account) {
            return;
        }
        return getResponse<R>(`players/${account}/${url}`);
    }

    async function getResponse<R>(url: string) {
        const response = await fetch(`${baseUrl}/${url}`);
        if (response) {
            return response.json() as R;
        }
    }

    return {
        getRecentMatches: async (player: string) =>
            getPlayerResponse<ReadonlyArray<RecentMatch>>("recentMatches", player),
        getPlayerHeroes: async (player: string, heroId?: number) => {
            const heroQuery = heroId && !isNaN(heroId) ? `?hero_id=${heroId}` : "";
            return getPlayerResponse<ReadonlyArray<PlayerHero>>(`heroes${heroQuery}`, player);
        },
        getWl: async (player: string, limit?: number) => {
            const limitQuery = limit && Number.isInteger(limit) ? `?limit=${limit}` : "";
            return getPlayerResponse<WinLose>(`wl${limitQuery}`, player);
        },
        getMatch: async (matchId: number) => getResponse<Match>(`matches/${matchId}`),
    };
}

export type DotaApi = {
    getRecentMatches: (player: string) => Promise<ReadonlyArray<RecentMatch> | undefined>;
    getPlayerHeroes: (
        player: string,
        heroId?: number
    ) => Promise<ReadonlyArray<PlayerHero> | undefined>;
    getWl: (player: string, limit?: number) => Promise<WinLose | undefined>;
    getMatch: (matchId: number) => Promise<Match | undefined>;
};

export const nullDotaApi: DotaApi = {
    getRecentMatches: async (player: string) => undefined,
    getPlayerHeroes: async (player: string, heroId?: number) => undefined,
    getWl: async (player: string, limit?: number) => undefined,
    getMatch: async (matchId: number) => undefined,
};
