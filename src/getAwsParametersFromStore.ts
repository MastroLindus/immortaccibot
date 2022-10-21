import AWS from "aws-sdk";
import { Parameter } from "aws-sdk/clients/ssm";

const SSM = new AWS.SSM();

const parameters = ['all_users', 'bot_token', 'dota_accounts'] as const;
type ParameterNames = typeof parameters[number];

const defaultParams = parameters.reduce((result, current) => {
    result[current] = "";
    return result;
}, {} as Record<ParameterNames, string>)

export async function getAwsParametersFromStore(): Promise<Record<ParameterNames, string>> {
    if (process.env.IS_OFFLINE) {
        return offlineParameters;
    }

    const params = {
        Names: [...parameters],
        WithDecryption: true
    };
    const request = await SSM.getParameters(params).promise();

    return request?.Parameters?.reduce<Record<ParameterNames, string>>((result: Record<ParameterNames, string>, k: Parameter) =>
        ({ ...result, [k.Name!]: k.Value }), defaultParams) ?? defaultParams;

}

const offlineParameters = { "all_users": "gino,pilotino", "bot_token": "5726078934:AAEVOhqhQOAAdPMbFsiQFBSCNnTgOZm7vuo", "dota_accounts": "sir_ij=99265187,Stefano_28=8301649,gfrr89=12991488" }


