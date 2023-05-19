import { model } from "./handler.js";

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
    const users = model.params.all_users
        .split(",")
        .map((u) => `@${u}`)
        .join(" ");
    if (params) {
        return `${users} ${params}`;
    }
    return `${users} adunataaaa`;
}
