import { test } from "@japa/runner";
import { parseAndHandleRequest } from "../src/parseAndHandleRequest.js";
import { model } from "../src/bot.js";

test.group("ciccio", () => {
    test("culo", async ({ expect }) => {
        expect(await parseAndHandleRequest("/ciccio")).toEqual("culo");
    });
});

test.group("echo", () => {
    test("with params", async ({ expect }) => {
        expect(await parseAndHandleRequest("/echo 2")).toEqual("2");
    });

    test("without params", async ({ expect }) => {
        expect(await parseAndHandleRequest("/echo")).toEqual("Whassaaapp?");
    });
});

test.group("dota", () => {
    model.dotaApi.getWl = async (player: string, limit?: number) => ({ win: 5, lose: 3 });
    model.params.all_users = "gino";

    test("win-lose", async ({ expect }) => {
        expect(await parseAndHandleRequest("/dotaWl gino")).toEqual(
            `
    Match won: 5
    Match lost: 3
    Win rate: 62.5%`
        );
    });
});
