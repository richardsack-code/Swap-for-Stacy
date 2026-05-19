import { ObjectId } from 'mongodb';
import { getBucket } from '../config/gridfs.js';
import Item from "../models/Item.js";

export async function uploadImages (files, userId) {

    if (!files || !Array.isArray(files) || files.length === 0) {
        return []; // return empty array, in case no images were sent
    }
    const imageIds = [];

    for (const file of files) {

        const bucket = getBucket();
        const uploadStream = bucket.openUploadStream(`${userId}/${file.originalname}`, {
            contentType: file.mimetype,
            metadata: { userId }
        });

        await new Promise((resolve, reject) => {
            uploadStream.end(file.buffer, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        imageIds.push(uploadStream.id);
    }

    return imageIds;
}

export async function updateImageArray (itemId, files, userId) {
    const imageIds = await uploadImages(files, userId);

    const updatedItem = await Item.findByIdAndUpdate(
        itemId,
        { $push: { images: { $each: imageIds } } },
        { new: true }
    );

    if (!updatedItem) throw new Error('Item not found');

    return updatedItem;
}


export async function deleteImage (id) {
    const bucket = getBucket();
    const fileId = new ObjectId(id);
    await bucket.delete(fileId);
}
