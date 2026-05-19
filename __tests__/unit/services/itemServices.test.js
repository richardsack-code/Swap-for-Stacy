import {createAndAssignItem, findItem, updateItemDesc, updateItemName, deleteItem} from "../../../src/services/itemServices.js";
import {uploadImages} from "../../../src/services/imageServices.js";
import {test, expect, describe, vi, beforeEach} from "vitest";
import Swapper from "../../../src/models/Swapper.js";
import Item from "../../../src/models/Item.js";

vi.mock("../../../src/models/Swapper.js");
vi.mock("../../../src/models/Item.js");
vi.mock("../../../src/services/imageServices.js");

describe("correct creation and saving of Item, update of Swapper", () => {
    const testItemName = "Test Item Name";
    const testItemDesc = "This is a description for a test item";

    let mockSave;
    let testSwapper;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSave = vi.fn().mockResolvedValue();

        Swapper.mockImplementation(function() {
            return {
                _id: 'mock_swapper_id',
                name: "Sir Testalot",
                email: "some@email.de",
                password: "$2b$10$fakeHash",
                save: mockSave
            }
        });

        testSwapper = new Swapper();

        Item.mockImplementation(function (data) {
            return {
                name: data?.name || testItemName,
                description: data?.description || testItemDesc,
                images: data?.images || [],
                video: data?.video || null,
                swapper: data?.swapper || testSwapper,
                save: mockSave
            }
        });

        Swapper.findOneAndUpdate.mockResolvedValue();
    });

    test("creating Item with no images", async () => {
        uploadImages.mockResolvedValue([]);

        const result = await createAndAssignItem(
            testItemName,
            testItemDesc,
            [],
            null,
            testSwapper
        );

        expect(uploadImages).toHaveBeenCalledWith([], 'mock_swapper_id');
        expect(Item).toHaveBeenCalledWith({
            name: testItemName,
            description: testItemDesc,
            images: [],
            video: null,
            swapper: testSwapper
        });

        expect(Swapper.findOneAndUpdate).toHaveBeenCalledWith(
            {email: testSwapper.email},
            {$push: { items: expect.any(Object)}}
        );

        expect(mockSave).toHaveBeenCalled();

        expect(result).toBeDefined();
        expect(result.name).toBe(testItemName);
    });

    test("creating Item with uploaded images", async () => {
        const mockImageIds = ['id1', 'id2'];
        uploadImages.mockResolvedValue(mockImageIds);

        const mockFiles = [
            { originalname: 'pic1.png', mimetype: 'image/png', buffer: Buffer.from('img1') },
            { originalname: 'pic2.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('img2') }
        ];

        const result = await createAndAssignItem(
            testItemName,
            testItemDesc,
            mockFiles,
            'http://video.url',
            testSwapper
        );

        expect(uploadImages).toHaveBeenCalledWith(mockFiles, 'mock_swapper_id');
        expect(Item).toHaveBeenCalledWith({
            name: testItemName,
            description: testItemDesc,
            images: mockImageIds,
            video: 'http://video.url',
            swapper: testSwapper
        });
        expect(result.images).toEqual(mockImageIds);
    });
});