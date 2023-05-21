import { getUsersFromAws } from "./aws/dynamoStore.js";

export type User = {
    user_id: string;
    dota_account?: number;
    alias: Set<string>;
    notifications_enabled: string;
};

export const isOffline = !!process.env.IS_OFFLINE;

let userCache: ReadonlyArray<User> = [];
export async function getUsers(useOfflineUsers = isOffline) {
    if (userCache.length == 0) {
        if (useOfflineUsers) {
            userCache = offlineUsers;
        } else {
            userCache = await getUsersFromAws();
        }
    }
    return userCache;
}

export const options = {
    aws: {
        region: "eu-west-1",
    },
};

const offlineUsers: ReadonlyArray<User> = [
    { user_id: "gino", dota_account: 171028175, alias: new Set(), notifications_enabled: "true" },
    { user_id: "ciccio", alias: new Set("dario"), notifications_enabled: "false" },
];
