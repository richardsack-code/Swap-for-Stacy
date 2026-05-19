import {hashPassword, compareHash} from "../../src/utils/passwordHasher.js";
import {test, expect} from "vitest";

test("tests if a hash is returned, instead of plaintext", async() => {
   const testHash = await hashPassword("password");

   expect(testHash).not.toStrictEqual("password");
   expect(testHash).toMatch(/^\$2[ab]\$\d+\$/); //bcrypt-format for hashing
   expect(testHash).toHaveLength(60); //bcrypt hash length
});