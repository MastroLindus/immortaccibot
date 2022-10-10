import AWS from "aws-sdk";
import { Parameter } from "aws-sdk/clients/ssm";

const SSM = new AWS.SSM();

type ParameterNames = "all_users" | "bot_token";

let cachedParameters: Record<ParameterNames, string> | null = null;

export async function getAwsParameters(): Promise<Record<ParameterNames, string>> {
    if (!cachedParameters) {
        cachedParameters = await getAwsParametersFromStore();
    }
    return cachedParameters;

}

async function getAwsParametersFromStore(): Promise<Record<ParameterNames, string>> {
    const params = {
        Names: ['all_users', 'bot_token'],
        WithDecryption: true
    };
    const defaultParams = { "all_users": "", "bot_token": "" };
    const request = await SSM.getParameters(params).promise();

    return request?.Parameters?.reduce<Record<ParameterNames, string>>((result: Record<ParameterNames, string>, k: Parameter) =>
        ({ ...result, [k.Name!]: k.Value }), defaultParams) ?? defaultParams;

}

