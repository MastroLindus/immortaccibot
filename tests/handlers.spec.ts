import { test } from "@japa/runner";
import { parseAndHandleRequest } from "../src/parseAndHandleRequest.js";
import { dotaApi } from "../src/dota/dotaApi.js";
import { User, getUsers } from "../src/model/users.js";

getUsers(true);

test.group("ciccio", () => {
    test("culo", async ({ expect }) => {
        expect(await parseAndHandleRequest("testuser", "/ciccio")).toEqual("culo");
    });
});

test.group("echo", () => {
    test("with params", async ({ expect }) => {
        expect(await parseAndHandleRequest("testuser", "/echo 2")).toEqual("2");
    });

    test("without params", async ({ expect }) => {
        expect(await parseAndHandleRequest("testuser", "/echo")).toEqual("Whassaaapp?");
    });
});

test.group("dota", () => {
    // TODO better mocking instead of patching global object
    dotaApi.getWl = async (user: User, limit?: number) => ({ win: 5, lose: 3 });

    test("win-lose", async ({ expect }) => {
        expect(await parseAndHandleRequest("testuser", "/dotaWl gino")).toEqual(
            `
    Match won: 5
    Match lost: 3
    Win rate: 62.5%`
        );
    });
});
