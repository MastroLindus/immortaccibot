import { model } from "./bot.js";
import { getAwsParametersFromStore } from "./aws/parameterStore.js";

const parameters = ["all_users", "bot_token", "dota_accounts"] as const;
type ParameterNames = (typeof parameters)[number];

export const nullParams = parameters.reduce((result, current) => {
    result[current] = "";
    return result;
}, {} as Record<ParameterNames, string>);

const offlineParams = {
    all_users: "gino,ciccio",
    bot_token: "",
    dota_accounts: "gino=171028175",
};

export async function getParameters(): Promise<Record<ParameterNames, string>> {
    if (model.isOffline) {
        return offlineParams;
    }

    return getAwsParametersFromStore(parameters) ?? nullParams;
}
