import { AttributeValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { User } from "../model/users.js";
import { dynamoClient } from "./dynamoStore.js";

function mapResultToUser(item: Record<string, AttributeValue>) {
    const user: User = {
        user_id: item["user_id"].S!,
        dota_account: item["dota_account"] ? parseInt(item["dota_account"].N!, 10) : undefined,
        alias: new Set(item["alias"].SS ?? []),
        notifications_enabled: item["notifications_enabled"].S!,
    };
    return user;
}

export async function getUsersFromAws(): Promise<ReadonlyArray<User>> {
    const command = new ScanCommand({ TableName: "users" });
    try {
        const results = await dynamoClient.send(command);
        return results.Items?.map(mapResultToUser) ?? [];
    } catch (err) {
        console.error(err);
    }
    return [];
}
