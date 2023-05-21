import { getUsers } from "./model.js";

export async function extractUserFromParams(initialParams?: string) {
    if (!initialParams) {
        return;
    }

    const [user, ...rest] = initialParams.split(" ");
    const userLower = user.toLowerCase().replace("@", "");
    const users = await getUsers();
    const foundUser = users.find(
        (u) => u.user_id.toLowerCase() == userLower || u.alias.has(userLower)
    );
    if (foundUser) {
        return { user: userLower, params: rest?.join(" ") };
    }
}

export function timeToCETString(time: Date): string {
    return time.toLocaleString("it-IT", { timeZone: "Europe/Amsterdam" });
}
