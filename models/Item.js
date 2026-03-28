import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true},
    description: { type: String, required: true},
    images: [String],
    video: String,
    swapper: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Swapper' }]
});

const Item = mongoose.model('Item', itemSchema);

export default Item;