import { nullDotaApi } from "./dota/dotaApi.js";

export const options = {
    aws: {
        region: "eu-west-1",
    },
};

export const parameters = ["all_users", "dota_accounts"] as const;
export type ParameterNames = (typeof parameters)[number];

export const nullParams = parameters.reduce((result, current) => {
    result[current] = "";
    return result;
}, {} as Record<ParameterNames, string>);

export const offlineParams = {
    all_users: "gino,ciccio",
    dota_accounts: "gino=171028175",
};

export const model = {
    params: nullParams,
    dotaApi: nullDotaApi,
    _fetched: false,
    isOffline: process.env.IS_OFFLINE,
};
