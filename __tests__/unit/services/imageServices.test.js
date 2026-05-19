import { describe, test, expect, vi, beforeEach } from 'vitest';
import { uploadImages, updateImageArray, deleteImage } from '../../../src/services/imageServices.js';
import { getBucket } from '../../../src/config/gridfs.js';
import Item from '../../../src/models/Item.js';
import { ObjectId } from 'mongodb';

vi.mock('../../../src/config/gridfs.js');
vi.mock('../../../src/models/Item.js');

describe('imageServices', () => {
    let mockUploadStream;
    let mockBucket;

    beforeEach(() => {
        vi.clearAllMocks();

        mockUploadStream = {
            id: new ObjectId('507f1f77bcf86cd799439011'),
            end: vi.fn()
        };

        mockBucket = {
            openUploadStream: vi.fn().mockReturnValue(mockUploadStream),
            delete: vi.fn().mockResolvedValue()
        };

        getBucket.mockReturnValue(mockBucket);
    });

    describe('uploadImages', () => {
        test('should upload multiple files to GridFS and return their ObjectIds', async () => {
            mockUploadStream.end.mockImplementation((buffer, callback) => callback(null));

            const mockFiles = [
                { originalname: 'test1.png', mimetype: 'image/png', buffer: Buffer.from('file1') },
                { originalname: 'test2.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('file2') }
            ];

            const result = await uploadImages(mockFiles, 'user123');

            expect(mockBucket.openUploadStream).toHaveBeenCalledTimes(2);
            expect(mockBucket.openUploadStream).toHaveBeenNthCalledWith(1, 'user123/test1.png', {
                contentType: 'image/png',
                metadata: { userId: 'user123' }
            });
            expect(mockBucket.openUploadStream).toHaveBeenNthCalledWith(2, 'user123/test2.jpg', {
                contentType: 'image/jpeg',
                metadata: { userId: 'user123' }
            });
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(ObjectId);
        });

        test('should return empty array when files array is empty', async () => {
            const result = await uploadImages([], 'user123');
            expect(result).toEqual([]);
            expect(mockBucket.openUploadStream).not.toHaveBeenCalled();
        });

        test('should return empty array when files is null', async () => {
            const result = await uploadImages(null, 'user123');
            expect(result).toEqual([]);
            expect(mockBucket.openUploadStream).not.toHaveBeenCalled();
        });

        test('should return empty array when files is undefined', async () => {
            const result = await uploadImages(undefined, 'user123');
            expect(result).toEqual([]);
            expect(mockBucket.openUploadStream).not.toHaveBeenCalled();
        });

        test('should reject when GridFS upload stream emits an error', async () => {
            mockUploadStream.end.mockImplementation((buffer, callback) => callback(new Error('GridFS write failed')));

            const mockFiles = [
                { originalname: 'bad.png', mimetype: 'image/png', buffer: Buffer.from('file') }
            ];

            await expect(uploadImages(mockFiles, 'user123')).rejects.toThrow('GridFS write failed');
        });
    });

    describe('updateImageArray', () => {
        test('should upload new images and push them to existing item', async () => {
            mockUploadStream.end.mockImplementation((buffer, callback) => callback(null));
            Item.findByIdAndUpdate.mockResolvedValue({ _id: 'item1', images: [mockUploadStream.id] });

            const mockFiles = [
                { originalname: 'new.png', mimetype: 'image/png', buffer: Buffer.from('file') }
            ];

            const result = await updateImageArray('item1', mockFiles, 'user123');

            expect(Item.findByIdAndUpdate).toHaveBeenCalledWith(
                'item1',
                { $push: { images: { $each: [mockUploadStream.id] } } },
                { new: true }
            );
            expect(result).toEqual({ _id: 'item1', images: [mockUploadStream.id] });
        });

        test('should throw "Item not found" when item does not exist', async () => {
            mockUploadStream.end.mockImplementation((buffer, callback) => callback(null));
            Item.findByIdAndUpdate.mockResolvedValue(null);

            const mockFiles = [
                { originalname: 'orphan.png', mimetype: 'image/png', buffer: Buffer.from('file') }
            ];

            await expect(updateImageArray('nonexistent', mockFiles, 'user123')).rejects.toThrow('Item not found');
        });
    });

    describe('deleteImage', () => {
        test('should delete image from GridFS by id', async () => {
            await deleteImage('507f1f77bcf86cd799439011');
            expect(mockBucket.delete).toHaveBeenCalledTimes(1);
            expect(mockBucket.delete).toHaveBeenCalledWith(expect.any(ObjectId));
        });
    });
});