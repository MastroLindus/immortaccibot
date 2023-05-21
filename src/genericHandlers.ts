import { getUsers } from "./model.js";

export async function unknownHandler() {
    // we could return a message to the user that the command is invalid, but ignoring it is probably even better.
}

export async function ciccio() {
    return "culo";
}

export async function echo(params?: string) {
    return params ?? "Whassaaapp?";
}

export async function pingAll(params?: string) {
    const users = await getUsers();
    const userIds = users
        .filter((u) => u.notifications_enabled != "false")
        .map((u) => `@${u.user_id}`)
        .join(" ");
    if (params) {
        return `${userIds} ${params}`;
    }
    return `${userIds} adunataaaa`;
}
