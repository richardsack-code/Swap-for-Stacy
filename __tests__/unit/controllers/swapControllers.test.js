import { describe, test, expect, vi, beforeEach } from 'vitest';
import { wannaSwap, updateSwap, deleteSwapItem } from '../../../src/controllers/swapController.js';
import { findSwapperById, findSwapperByMail, createSwapper } from '../../../src/services/swapperServices.js';
import { createAndAssignItem, findItem, updateItemDesc, updateItemName, deleteItem } from '../../../src/services/itemServices.js';
import { compareHash } from '../../../src/utils/passwordHasher.js';
import { updateImageArray, deleteImage } from '../../../src/services/imageServices.js';

vi.mock('../../../src/services/swapperServices.js');
vi.mock('../../../src/services/itemServices.js');
vi.mock('../../../src/utils/passwordHasher.js');
vi.mock('../../../src/services/imageServices.js');

describe('testing swapController - wannaSwap', () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            body: {
                name: 'Sir Testalot',
                email: 'sir@testalot.com',
                password: 'password',
                itemName: 'Vintage Camera',
                itemDescription: 'A cool old camera',
                video: null
            },
            files: []
        };

        res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
    });

    test('should create a new swapper and item when the swapper does not exist', async () => {
        findSwapperByMail.mockResolvedValue(null);
        createSwapper.mockResolvedValue({ _id: 'new_id', email: 'sir@testalot.com' });
        createAndAssignItem.mockResolvedValue({ id: 'item_id' });

        await wannaSwap(req, res);

        expect(createSwapper).toHaveBeenCalledWith('Sir Testalot', 'sir@testalot.com', 'password');
        expect(createAndAssignItem).toHaveBeenCalledWith(
            'Vintage Camera',
            'A cool old camera',
            [],
            null,
            expect.objectContaining({ _id: 'new_id', email: 'sir@testalot.com' })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith("Thank you for your swap! I bet it'll be awesome!");
    });

    test('should pass uploaded files to createAndAssignItem when images are uploaded', async () => {
        findSwapperByMail.mockResolvedValue(null);
        createSwapper.mockResolvedValue({ _id: 'new_id', email: 'sir@testalot.com' });
        createAndAssignItem.mockResolvedValue({ id: 'item_id' });

        req.files = [
            { originalname: 'photo.png', mimetype: 'image/png', buffer: Buffer.from('img') }
        ];

        await wannaSwap(req, res);

        expect(createAndAssignItem).toHaveBeenCalledWith(
            'Vintage Camera',
            'A cool old camera',
            req.files,
            null,
            expect.objectContaining({ _id: 'new_id' })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should work when no images are uploaded (req.files undefined)', async () => {
        findSwapperByMail.mockResolvedValue(null);
        createSwapper.mockResolvedValue({ _id: 'new_id', email: 'sir@testalot.com' });
        createAndAssignItem.mockResolvedValue({ id: 'item_id' });

        delete req.files; // simulates no file input at all

        await wannaSwap(req, res);

        expect(createAndAssignItem).toHaveBeenCalledWith(
            'Vintage Camera',
            'A cool old camera',
            undefined,
            null,
            expect.objectContaining({ _id: 'new_id' })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 401 if the password does not match', async () => {
        findSwapperByMail.mockResolvedValue({ email: 'sir@testalot.com', password: 'hashed_password' });
        compareHash.mockResolvedValue(false);

        await wannaSwap(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith("Incorrect Password.");
        expect(createAndAssignItem).not.toHaveBeenCalled();
    });

    test('should return 409 if the item already exists for that swapper', async () => {
        const mockSwapper = { email: 'sir@testalot.com', password: 'hashed_password' };
        findSwapperByMail.mockResolvedValue(mockSwapper);
        compareHash.mockResolvedValue(true);
        findItem.mockResolvedValue({ id: 'existing_item' });

        await wannaSwap(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.send).toHaveBeenCalledWith("You already suggested this item.");
    });

    test('should return 500 if an unexpected error occurs', async () => {
        findSwapperByMail.mockRejectedValue(new Error('DB Connection Failed'));

        await wannaSwap(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Something went wrong. Please try again.");
    });
});

describe('testing swapController - updateSwap', () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            body: {
                swapperID: 'swapper123',
                itemDescription: 'Updated description',
                itemName: 'Updated Name'
            },
            params: { slug: 'old-name' },
            files: null
        };

        res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
    });

    test('should update item description, name and images when all provided', async () => {
        findSwapperById.mockResolvedValue({ _id: 'swapper123' });
        findItem.mockResolvedValue({ _id: 'item456' });
        updateItemDesc.mockResolvedValue();
        updateItemName.mockResolvedValue();
        updateImageArray.mockResolvedValue({ _id: 'item456', images: ['id1'] });

        req.files = [
            { originalname: 'new.png', mimetype: 'image/png', buffer: Buffer.from('img') }
        ];

        await updateSwap(req, res);

        expect(updateItemDesc).toHaveBeenCalledWith('old-name', 'swapper123', 'Updated description');
        expect(updateItemName).toHaveBeenCalledWith('old-name', 'swapper123', 'Updated Name');
        expect(findItem).toHaveBeenCalledWith('Updated Name', { _id: 'swapper123' });
        expect(updateImageArray).toHaveBeenCalledWith('item456', req.files, 'swapper123');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Your Swap has been updated." });
    });

    test('should only update description when no images provided', async () => {
        findSwapperById.mockResolvedValue({ _id: 'swapper123' });
        updateItemDesc.mockResolvedValue();

        req.body.itemName = undefined; // ensure only description is updated

        await updateSwap(req, res);

        expect(updateItemDesc).toHaveBeenCalledWith('old-name', 'swapper123', 'Updated description');
        expect(updateItemName).not.toHaveBeenCalled();
        expect(updateImageArray).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 500 when findSwapperById throws', async () => {
        findSwapperById.mockRejectedValue(new Error('DB Error'));

        await updateSwap(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong. Please try again." });
    });
});

describe('testing swapController - deleteSwapItem', () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            body: {
                itemName: 'Old Item',
                swapperID: 'swapper123'
            }
        };

        res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
    });

    test('should delete all images and then the item', async () => {
        findSwapperById.mockResolvedValue({
            _id: 'swapper123',
            images: ['img1', 'img2', 'img3']
        });
        deleteImage.mockResolvedValue();
        deleteItem.mockResolvedValue();

        await deleteSwapItem(req, res);

        expect(deleteImage).toHaveBeenCalledTimes(3);
        expect(deleteImage).toHaveBeenNthCalledWith(1, 'img1');
        expect(deleteImage).toHaveBeenNthCalledWith(2, 'img2');
        expect(deleteImage).toHaveBeenNthCalledWith(3, 'img3');
        expect(deleteItem).toHaveBeenCalledWith('Old Item', 'swapper123');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Very well. Your item has been deleted." });
    });

    test('should return 500 when findSwapperById throws', async () => {
        findSwapperById.mockRejectedValue(new Error('DB Error'));

        await deleteSwapItem(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong. Please try again." });
    });
});