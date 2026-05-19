import {describe, test, expect, vi, beforeEach} from "vitest";
import {createSwapper, getSwapperItems} from "../../../src/services/swapperServices.js";
import Swapper from "../../../src/models/Swapper.js";
import {hashPassword} from "../../../src/utils/passwordHasher.js";

vi.mock("../../../src/models/Swapper.js");
vi.mock("../../../src/models/Item.js");
vi.mock("../../../src/utils/passwordHasher.js");

describe("Test creating a Swapper", () => {

    const testMail = "some@email.de";
    const testName = "Max Mustermann";
    const testPassword = "password";

    let mockSave;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSave = vi.fn().mockResolvedValue();

        hashPassword.mockResolvedValue("$2b$10$fakeHash");

        Swapper.mockImplementation(function() {
            return {
                save: mockSave,
                name: testName,
                email: testMail,
                password: "$2b$10$fakeHash"
            };
        });

    });

    test("create swapper, no missing information", async () => {
        const result = await createSwapper(testName, testMail, testPassword);

        expect(hashPassword).toHaveBeenCalledWith(testPassword);
        expect(Swapper).toHaveBeenCalledWith({
            name: testName,
            email: testMail,
            password: "$2b$10$fakeHash"
        });
        expect(mockSave).toHaveBeenCalled();
        expect(result.name).toBe(testName);
    });

    test("throws error when hashPassword fails", async () => {
        hashPassword.mockRejectedValue(new Error("Hashing failed"));

        await expect(createSwapper(testName, testMail, testPassword))
            .rejects.toThrow("Hashing failed");
    });
});

describe("Test getting the items that have been assigned to a swapper", () => {
    const testMail = "some@email.de";
    const testName = "Max Mustermann";
    const testPassword = "$2b$10$fakeHash";

    let mockSave;
    let testSwapper;
    let testItemArray;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSave = vi.fn().mockResolvedValue();
        testItemArray = [
                {name: "item1", description: "description item1", swapper: testSwapper},
                {name: "item2", description: "description item2", swapper: testSwapper},
                {name: "item3", description: "description item3", swapper: testSwapper}
        ];

        Swapper.mockImplementation(function() {
            return {
                save: mockSave,
                name: testName,
                email: testMail,
                password: testPassword,
            };
        });

        testSwapper = new Swapper();

    });

    test("calling getSwapperItems returns items if Swapper has Items", async () => {
        Swapper.findOne.mockReturnValue({
            populate: vi.fn().mockReturnValue({
                exec: vi.fn().mockResolvedValue({
                    items:testItemArray
                })
            })
        });

        const result = await getSwapperItems(testSwapper);

        expect(Swapper.findOne).toHaveBeenCalledWith({
            email: testMail,
            password: testPassword
        });
        expect(result).toEqual(testItemArray);
    });

    test("returns empty array when Swapper has no Items assigned", async () => {
        Swapper.findOne.mockReturnValue({
            populate: vi.fn().mockReturnValue({
                exec: vi.fn().mockReturnValue({
                    items: []
                })
            })
        });

        const result = await getSwapperItems(testSwapper);

        expect(result).toEqual([]);
    });

    test("throws error, when Swapper isn't found", async () => {
       Swapper.findOne.mockReturnValue({
           populate: vi.fn().mockReturnValue({
               exec: vi.fn().mockResolvedValue(null)
           })
       });

       await expect(getSwapperItems(testSwapper)).rejects.toThrow("Swapper not found");
    });

});


