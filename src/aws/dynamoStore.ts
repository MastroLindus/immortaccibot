import {
    // DynamoDBClient,
    // ListTablesCommand,
    DynamoDB,
    AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { User, options } from "../model.js";

// const client = new DynamoDBClient({ region: options.aws.region });
const dynamo = new DynamoDB({ region: options.aws.region });

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
        dota_account: parseInt(item["dota_account"].N!, 10),
        alias: new Set(item["alias"].SS!),
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
