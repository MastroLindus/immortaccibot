import {
    AttributeValue,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
    ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { Lobby, UserLobby } from "../model/lobbies.js";
import { dynamoClient } from "./dynamoStore.js";
const tableName = "lobbies";

function mapResultToLobby(item: Record<string, AttributeValue>) {
    const lobby: Lobby = {
        game_id: item["game_id"].S!,
        is_complete: item["is_complete"].BOOL ?? false,
        current_players: parseInt(item["current_players"].N!, 10),
        min_players: item["min_players"] ? parseInt(item["min_players"].N!, 10) : 2,
        max_players: item["max_players"] && parseInt(item["max_players"].N!, 10),
        ttl: item["ttl"] && parseInt(item["ttl"].N!, 10),
    };
    return lobby;
}

function mapResultToUserLobbies(item: Record<string, AttributeValue>) {
    const lobby: UserLobby = {
        game_id: item["game_id"].S!,
        user_id: item["user_id"].S!,
        ttl: item["ttl"] && parseInt(item["ttl"].N!, 10),
    };
    return lobby;
}

function mapResultToLobbyAndUserLobby(results: ReadonlyArray<Record<string, AttributeValue>>) {
    const [lobby, ...userLobbies] = results;
    return [mapResultToLobby(lobby), userLobbies.map(mapResultToUserLobbies)] as const;
}

export async function getLobby(game_id: string) {
    const command = new GetItemCommand({ TableName: tableName, Key: { game_id: { S: game_id } } });
    try {
        const result = (await dynamoClient.send(command)).Item;
        if (result) {
            return mapResultToLobby(result);
        }
    } catch (err) {
        console.error(err);
    }
}

export async function getLobbyWithUserLobbies(
    game_id: string
): Promise<readonly [Lobby | undefined, UserLobby[]]> {
    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "game_id = :game",
        ExpressionAttributeValues: {
            ":game": { S: game_id },
        },
    });
    try {
        const result = (await dynamoClient.send(command)).Items;
        if (result) {
            return mapResultToLobbyAndUserLobby(result);
        }
        return [undefined, []];
    } catch (err) {
        console.error(err);
        return [undefined, []];
    }
}

function getTTL(expireInSeconds = 3600) {
    return String(Math.floor(Date.now() / 1000) + 3600);
}

export async function setUserLobby(userLobby: UserLobby) {
    const command = new PutItemCommand({
        TableName: tableName,
        Item: {
            game_id: { S: userLobby.game_id },
            user_id: { S: userLobby.user_id },
            ttl: { N: getTTL(userLobby.ttl) },
        },
    });
    try {
        await dynamoClient.send(command);
    } catch (err) {
        console.error(err);
    }
}

export async function setLobby(lobby: Lobby) {
    const command = new PutItemCommand({
        TableName: tableName,
        Item: {
            game_id: { S: lobby.game_id },
            user_id: { S: "__lobby" },
            current_players: { N: String(lobby.current_players) },
            min_players: { N: String(lobby.min_players ?? 0) },
            max_players: { N: String(lobby.max_players ?? 0) },
            is_complete: { BOOL: lobby.is_complete ?? false },
            ttl: { N: getTTL(lobby.is_complete ? 300 : 3600) },
        },
    });
    try {
        await dynamoClient.send(command);
    } catch (err) {
        console.error(err);
    }
}

export async function getLobbies(): Promise<ReadonlyArray<Lobby>> {
    const command = new ScanCommand({ TableName: tableName });
    try {
        const results = await dynamoClient.send(command);
        return results.Items?.map(mapResultToLobby) ?? [];
    } catch (err) {
        console.error(err);
    }
    return [];
}
