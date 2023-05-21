import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { options } from "../bot.js";

const client = new DynamoDBClient({ region: options.aws.region });

export async function listTables() {
    const command = new ListTablesCommand({});
    try {
        const results = await client.send(command);
        return results.TableNames!.join("\n");
    } catch (err) {
        console.error(err);
    }
}
