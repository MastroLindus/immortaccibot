import { getUsersFromAws } from "../aws/usersStore.js";
import { settings } from "../settings.js";

export type User = {
    user_id: string;
    dota_account?: number;
    alias: Set<string>;
    notifications_enabled: string;
};

let userCache: ReadonlyArray<User> = [];
export async function getUsers(useOfflineUsers = settings.isOffline) {
    if (userCache.length == 0) {
        if (useOfflineUsers) {
            userCache = offlineUsers;
        } else {
            userCache = await getUsersFromAws();
        }
    }
    return userCache;
}

const offlineUsers: ReadonlyArray<User> = [
    { user_id: "gino", dota_account: 171028175, alias: new Set(), notifications_enabled: "true" },
    { user_id: "ciccio", alias: new Set("dario"), notifications_enabled: "false" },
];
