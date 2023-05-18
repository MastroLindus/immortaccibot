import { model } from "./handler.js";

export function extractUserFromParams(initialParams?: string) {
    if (!initialParams) {
        return;
    }

    const [user, ...rest] = initialParams.split(" ");
    const userLower = user.toLowerCase().replace("@", "");
    if (model.params.all_users.toLowerCase().split(",").includes(userLower)) {

        return { user: userLower, params: rest?.join(" ") };
    }

}

export function timeToCETString(time: Date): string {
    return time.toLocaleString("it-IT", { timeZone: "Europe/Amsterdam" });
}