import { getLobbies, getLobby, setLobby } from "../aws/lobbiesStore.js";

export type Lobby = {
    game_id: string;
    members: Set<string>;
    is_complete: boolean;
    min_players: number;
    max_players?: number;
};

export async function getLobbyHandler(user_id: string, game_id?: string) {
    if (!game_id) {
        const lobbies = await getLobbies();
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
        const max_players = paramsSplit.length >= 3 ? parseInt(paramsSplit[2], 10) : undefined;
        const min_players = paramsSplit.length >= 2 ? parseInt(paramsSplit[1], 10) : undefined;
        const game_id = paramsSplit[0];
        return joinLobby(game_id, user_id, min_players, max_players);
    }
}

async function joinLobby(user_id: string, game_id: string, min_players = 2, max_players?: number) {
    const currentLobby = await getLobby(game_id);
    const lobby = currentLobby
        ? { ...currentLobby }
        : {
              game_id,
              members: new Set(user_id),
              min_players,
              max_players: max_players ?? 0,
              is_complete: false,
          };
    if (
        !lobby.members.has(user_id) &&
        (!lobby.max_players || lobby.members.size < lobby.max_players)
    ) {
        lobby.members.add(user_id);
    }
    if (!currentLobby || currentLobby.members.size < lobby.members.size) {
        const is_complete =
            (!!lobby.max_players && lobby.members.size == lobby.max_players) ||
            lobby.members.size >= lobby.min_players;
        lobby.is_complete = is_complete;
        setLobby(lobby);
        return "Joined!\n" + printLobby(lobby);
    }
    return "Cannot join :( \n" + printLobby(lobby);
}

function printLobby(lobby: Lobby) {
    const current = `Current: ${lobby.members.size}`;
    const minPlayers = lobby.min_players ? `, Min: ${lobby.min_players}` : "";
    const maxPlayers = lobby.max_players ? `, Max: ${lobby.max_players}` : "";
    const complete = lobby.is_complete ? "COMPLETE" : "";
    return `${lobby.game_id} ${complete} ${current} ${minPlayers} ${maxPlayers}`;
}
