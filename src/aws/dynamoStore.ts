import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { settings } from "../settings.js";

export const dynamoClient = new DynamoDBClient({ region: settings.aws.region });

// export async function listTables() {
//     const command = new ListTablesCommand({});
//     try {
//         const results = await client.send(command);
//         return results.TableNames!.join("\n");
//     } catch (err) {
//         console.error(err);
//     }
// }
