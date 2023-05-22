import {
    AttributeValue,
    GetItemCommand,
    PutItemCommand,
    ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { Lobby } from "../model/lobbies.js";
import { dynamoClient } from "./dynamoStore.js";
const tableName = "lobbies";

function mapResultToLobby(item: Record<string, AttributeValue>) {
    const lobby: Lobby = {
        game_id: item["game_id"].S!,
        members: new Set(item["members"].SS!),
        is_complete: item["is_complete"].BOOL ?? false,
        min_players: item["min_players"] ? parseInt(item["min_players"].N!, 10) : 2,
        max_players: item["max_players"] && parseInt(item["max_players"].N!, 10),
    };
    return lobby;
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

export async function setLobby(lobby: Lobby) {
    const command = new PutItemCommand({
        TableName: tableName,
        Item: {
            game_id: { S: lobby.game_id },
            members: { SS: [...lobby.members] },
            min_players: { N: String(lobby.min_players ?? 0) },
            max_players: { N: String(lobby.max_players ?? 0) },
            is_complete: { BOOL: lobby.is_complete ?? false },
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
