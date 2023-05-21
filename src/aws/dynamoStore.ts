import {
    // DynamoDBClient,
    // ListTablesCommand,
    DynamoDB,
    AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { User } from "../model.js";
import { settings } from "../settings.js";

// const client = new DynamoDBClient({ region: options.aws.region });
const dynamo = new DynamoDB({ region: settings.aws.region });

// export async function listTables() {
//     const command = new ListTablesCommand({});
//     try {
//         const results = await client.send(command);
//         return results.TableNames!.join("\n");
//     } catch (err) {
//         console.error(err);
//     }
// }

function mapResultToUser(item: Record<string, AttributeValue>) {
    const user: User = {
        user_id: item["user_id"].S!,
        dota_account: item["dota_account"].N ? parseInt(item["dota_account"].N!, 10) : undefined,
        alias: new Set(item["alias"].SS ?? []),
        notifications_enabled: item["notifications_enabled"].S!,
    };
    return user;
}

export async function getUsersFromAws(): Promise<ReadonlyArray<User>> {
    try {
        const results = await dynamo.scan({ TableName: "users" });
        return results.Items?.map(mapResultToUser) ?? [];
    } catch (err) {
        console.error(err);
    }
    return [];
}
