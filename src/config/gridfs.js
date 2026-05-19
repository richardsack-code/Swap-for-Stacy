import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';

let bucket;

mongoose.connection.once('open', () => {
    bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'images'
    });
});

export const getBucket = () => bucket;
