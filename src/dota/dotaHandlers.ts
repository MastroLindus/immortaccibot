import { model } from "../model.js";
import heroJson from "../../resources/dotaHeroes.json" assert { type: "json" };
import { extractUserFromParams, timeToCETString } from "../utils.js";
import { Match, MatchPlayerInfo, PlayerHero, WinLose } from "./dotaApi.js";

type DotaHero = (typeof heroJson)[number];

function prettyPrintMatchPlayerInfo(player: MatchPlayerInfo) {
    const hero = heroJson.find((h) => h.id == player.hero_id);
    const { kills, deaths, assists, net_worth } = player;
    const kda = `${kills}/${deaths}/${assists}`;
    return `${hero?.localized_name} (${
        player.personaname ?? "Unknown"
    }) - kda: ${kda} NW ${net_worth}`;
}

function prettyPrintPlayerHero(heroData: PlayerHero) {
    const hero = heroJson.find((h) => h.id == heroData.hero_id);
    const { games, win } = heroData;
    const rate = win == 0 || games == 0 ? 0 : (win / games) * 100;
    const truncatedRate = Math.trunc(rate * 100) / 100;
    return `${hero?.localized_name} wins: ${win} games: ${games} w/r ${truncatedRate}`;
}

function prettyPrintPlayerHeroes(data: ReadonlyArray<PlayerHero>, limit = 7) {
    return data.slice(0, limit).map(prettyPrintPlayerHero).join("\n");
}

function prettyPrint(match: Match) {
    const radiantPlayers = match.players.filter((p) => p.player_slot < 128);
    const direPlayers = match.players.filter((p) => p.player_slot >= 128);

    const rPlayersPrinted = radiantPlayers.map(prettyPrintMatchPlayerInfo).join("\n");
    const dPlayersPrinted = direPlayers.map(prettyPrintMatchPlayerInfo).join("\n");
    const durationMin = Math.floor(match.duration / 60);
    const durationSec = match.duration - durationMin * 60;

    return `Match ${match.match_id} 
Time: ${timeToCETString(new Date(match.start_time * 1000))}
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
    const rate = wl.win == 0 && wl.lose == 0 ? 0 : (wl.win / (wl.win + wl.lose)) * 100;
    const truncatedRate = Math.trunc(rate * 100) / 100;
    return `
    Match won: ${wl.win}
    Match lost: ${wl.lose}
    Win rate: ${truncatedRate}%`;
}

export async function lastMatchHandler(params?: string) {
    const data = await model.dotaApi.getRecentMatches(params!);
    if (data) {
        const matchInfo = await model.dotaApi.getMatch(data[0].match_id);
        if (matchInfo) {
            return prettyPrint(matchInfo);
        }
        return "match not found";
    }
}

export async function wlHandler(params?: string) {
    const paramsInfo = extractUserFromParams(params);
    if (paramsInfo) {
        const maybeNumber = Number(paramsInfo.params);
        const wlInfo = await model.dotaApi.getWl(paramsInfo.user, maybeNumber);
        if (wlInfo) {
            return prettyPrintWl(wlInfo);
        }
    }
}

function getHeroIdFromName(name: string) {
    const hero = heroJson.find(
        (h) => h.localized_name.toLocaleLowerCase() == name.toLocaleLowerCase()
    );
    return hero?.id;
}

export async function playerHeroesHandler(params?: string) {
    const paramsInfo = extractUserFromParams(params);

    if (paramsInfo) {
        const maybeHero = paramsInfo.params;
        const heroId = getHeroIdFromName(maybeHero);
        const playersHeroesInfo = await model.dotaApi.getPlayerHeroes(paramsInfo.user, heroId);
        if (playersHeroesInfo) {
            return prettyPrintPlayerHeroes(playersHeroesInfo, heroId !== undefined ? 1 : undefined);
        }
    }
}
