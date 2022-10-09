import AWS from "aws-sdk";
import { Parameter } from "aws-sdk/clients/ssm";
const SSM = new AWS.SSM();

export type ParameterNames = "all_users" | "bot_token";

export async function getParametersFromStore(): Promise<Record<ParameterNames, string>> {
    const params = {
        Names: ['all_users', 'bot_token'],/* required */
        WithDecryption: true
    };
    const defaultParams = { "all_users": "", "bot_token": "" };
    const request = await SSM.getParameters(params).promise();

    return request?.Parameters?.reduce<Record<ParameterNames, string>>((result: Record<ParameterNames, string>, k: Parameter) =>
        ({ ...result, [k.Name!]: k.Value }), defaultParams) ?? defaultParams;
}