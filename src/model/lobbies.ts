import {
    getLobbies,
    getLobby,
    getLobbyWithUserLobbies,
    setLobby,
    setUserLobby,
} from "../aws/lobbiesStore.js";

export type Lobby = {
    game_id: string;
    is_complete: boolean;
    current_players: number;
    min_players: number;
    max_players?: number;
    ttl?: number;
};
export type UserLobby = {
    user_id: string;
    game_id: string;
    ttl?: number;
};

export async function getLobbyHandler(user_id: string, game_id?: string) {
    if (!game_id) {
        const lobbies = await getLobbies();
        if (lobbies.length == 0) {
            return "No lobbies created yet, start one with /create!";
        }
        return lobbies.map(printLobby).join("\n");
    }
    const lobby = await getLobby(game_id);
    if (!lobby) {
        return `No lobby found for game ${game_id}`;
    }
    return printLobby(lobby);
}

export async function joinLobbyHandler(user_id: string, params?: string) {
    if (params) {
        const paramsSplit = params.split(" ");
        const game_id = paramsSplit[0];
        let timeLimit = 3600;
        if (paramsSplit.length == 2) {
            const timeLimitParam = paramsSplit[1];
            timeLimit = parseInt(timeLimitParam, 10);
        }
        if (game_id.indexOf("|") == -1) {
            return joinLobby(user_id, game_id, timeLimit);
        }
        const game_ids = game_id.split("|");
        const rest = await Promise.all(game_ids.map((gId) => joinLobby(user_id, gId, timeLimit)));
        return getLobbyHandler(user_id);
    }
}

export async function createLobbyHandler(user_id: string, params?: string) {
    if (params) {
        const paramsSplit = params.split(" ");
        const max_players = paramsSplit.length >= 3 ? parseInt(paramsSplit[2], 10) : undefined;
        const min_players = paramsSplit.length >= 2 ? parseInt(paramsSplit[1], 10) : undefined;
        const game_id = paramsSplit[0];
        if (game_id.indexOf("|") == -1) {
            return createLobby(game_id, min_players, max_players);
        }
        const game_ids = game_id.split("|");
        const rest = await Promise.all(game_ids.map((gId) => createLobby(gId)));
        return getLobbyHandler(user_id);
    }
}

export async function leaveLobbyHandler(user_id: string, game_id?: string) {
    if (game_id) {
        return leaveLobby(user_id, game_id);
    }
}

export async function startLobbyHandler(user_id: string, game_id?: string) {
    if (game_id) {
        return startLobby(game_id);
    }
}

async function createLobby(game_id: string, min_players = 2, max_players?: number) {
    const currentLobby = await getLobby(game_id);
    if (currentLobby) {
        return `Lobby ${game_id} already exists`;
    }
    const defaultGameSettings = knownLobbiesSettings[game_id] ?? {};
    const newLobby: Lobby = {
        game_id,
        min_players: min_players ?? defaultGameSettings["min"] ?? 2,
        max_players: max_players ?? defaultGameSettings["max"] ?? 0,
        is_complete: false,
        current_players: 0,
    };
    setLobby(newLobby);
    return `Lobby ${game_id} created!`;
}

async function joinLobby(user_id: string, game_id: string, timeLimit = 3600): Promise<string> {
    const [currentLobby, userLobbies] = await getLobbyWithUserLobbies(game_id);
    if (!currentLobby) {
        await createLobby(game_id);
        return joinLobby(user_id, game_id, timeLimit);
    }
    if (currentLobby.is_complete) {
        return `Lobby ${game_id} is already completed, too late!`;
    }
    const isUserNotInLobbyYet = userLobbies.every((u) => u.user_id != user_id);
    const totalPlayers = userLobbies.length + (isUserNotInLobbyYet ? 1 : 0);
    const isNowComplete =
        totalPlayers >= currentLobby.min_players &&
        (!currentLobby.max_players || totalPlayers == currentLobby.max_players);
    const newLobby = { ...currentLobby, is_complete: isNowComplete, current_players: totalPlayers };
    setLobby(newLobby);
    setUserLobby({ user_id, game_id, ttl: timeLimit });
    if (isNowComplete) {
        return notifyStart(game_id, [...userLobbies.map((u) => u.user_id), user_id]);
    }
    return `Done! (Current players: ${newLobby.current_players})`;
}

async function startLobby(game_id: string) {
    const [lobby, userLobbies] = await getLobbyWithUserLobbies(game_id);
    if (!lobby) {
        return `Lobby ${game_id} doesn't exist!`;
    }
    if (lobby.current_players <= 0) {
        return `Lobby ${game_id} doesn't have enough players!`;
    }
    setLobby({ ...lobby, is_complete: true });
    return notifyStart(
        game_id,
        userLobbies.map((u) => u.user_id)
    );
}

function notifyStart(game_id: string, userIds: ReadonlyArray<string>) {
    const pingString = userIds.map((id) => `@${id}`).join(" ");
    return `Lobby ${game_id} Complete!
        ${pingString}
        GO GO GO`;
}

async function leaveLobby(user_id: string, game_id: string) {
    const [currentLobby, userLobbies] = await getLobbyWithUserLobbies(game_id);
    if (!currentLobby) {
        return `Lobby ${game_id} doesn't exist`;
    }
    if (currentLobby.is_complete) {
        return `Lobby ${game_id} is already completed, too late!`;
    }
    const ownUserLobby = userLobbies.find((u) => u.user_id == user_id);
    if (!ownUserLobby) {
        return `${user_id} is not part of lobby ${game_id}`;
    }
    setUserLobby({ ...ownUserLobby, ttl: 1 });
    const newPlayerCount = currentLobby.current_players - 1;
    setLobby({ ...currentLobby, current_players: newPlayerCount });
    return `Done! (Current players: ${newPlayerCount})`;
}

function printLobby(lobby: Lobby) {
    const current = `Current: ${lobby.current_players}`;
    const minPlayers = lobby.min_players ? `, Min: ${lobby.min_players}` : "";
    const maxPlayers = lobby.max_players ? `, Max: ${lobby.max_players}` : "";
    const complete = lobby.is_complete ? "COMPLETE" : "";
    return `${lobby.game_id} ${complete} ${current} ${minPlayers} ${maxPlayers}`;
}

const knownLobbiesSettings: Record<string, { min: number; max?: number }> = {
    dota: { min: 4, max: 5 },
    pummel: { min: 4 },
    hunt: { min: 3, max: 3 },
    golf: { min: 4 },
};
