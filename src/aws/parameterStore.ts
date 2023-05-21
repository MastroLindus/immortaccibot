import { SSMClient, GetParametersCommand, Parameter } from "@aws-sdk/client-ssm";
import { options } from "../bot.js";

const client = new SSMClient({ region: options.aws.region });

export async function getAwsParametersFromStore<T extends string>(
    parameterNames: ReadonlyArray<T>
): Promise<Record<T, string>> {
    const params = {
        Names: [...parameterNames],
        WithDecryption: true,
    };
    const command = new GetParametersCommand(params);
    const response = await client.send(command);

    return (
        response?.Parameters?.reduce<Record<string, string>>(
            (result: Record<string, string>, k: Parameter) => ({
                ...result,
                [k.Name!]: k.Value ?? "",
            }),
            {}
        ) ?? {}
    );
}
