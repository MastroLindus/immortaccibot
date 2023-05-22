export const settings = {
    aws: {
        region: "eu-west-1",
    },
    logging: process.env.LOGGING_LEVEL ?? "info",
    isOffline: !!process.env.IS_OFFLINE,
};
