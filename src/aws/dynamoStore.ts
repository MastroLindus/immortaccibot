import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { options } from "../model.js";

const client = new DynamoDBClient({ region: options.aws.region });

export async function listTables() {
    console.log("INVOKING LIST TABLES");
    const command = new ListTablesCommand({});
    try {
        const results = await client.send(command);
        console.log("RESULTS");
        console.log(results);
        return results.TableNames!.join("\n");
    } catch (err) {
        console.error(err);
    }
}
