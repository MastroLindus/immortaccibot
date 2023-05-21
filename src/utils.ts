import { getUsers } from "./model.js";

export async function extractUserFromParams(initialParams?: string) {
    if (!initialParams) {
        return;
    }

    const [user, ...rest] = initialParams.split(" ");
    const foundUser = await getUserByIdOrAlias(user.replace("@", ""));
    if (foundUser) {
        return { user: foundUser, params: rest?.join(" ") };
    }
}

async function getUserByIdOrAlias(idOrAlias: string) {
    const users = await getUsers();
    const lowerQuery = idOrAlias.toLowerCase();
    return users.find((u) => u.user_id.toLowerCase() == lowerQuery || u.alias.has(lowerQuery));
}

export function timeToCETString(time: Date): string {
    return time.toLocaleString("it-IT", { timeZone: "Europe/Amsterdam" });
}
