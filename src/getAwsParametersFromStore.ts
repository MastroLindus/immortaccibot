import { SSMClient, GetParametersCommand, Parameter } from "@aws-sdk/client-ssm";

const client = new SSMClient({ region: "eu-west-1" });

const parameters = ['all_users', 'bot_token', 'dota_accounts'] as const;
type ParameterNames = typeof parameters[number];

export const nullParams = parameters.reduce((result, current) => {
    result[current] = "";
    return result;
}, {} as Record<ParameterNames, string>)

export async function getAwsParametersFromStore(): Promise<Record<ParameterNames, string>> {
    const params = {
        Names: [...parameters],
        WithDecryption: true
    };
    const command = new GetParametersCommand(params);
    const response = await client.send(command);

    return response?.Parameters?.reduce<Record<ParameterNames, string>>((result: Record<ParameterNames, string>, k: Parameter) =>
        ({ ...result, [k.Name!]: k.Value }), nullParams) ?? nullParams;

}



