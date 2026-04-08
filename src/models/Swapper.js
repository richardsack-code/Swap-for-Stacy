import mongoose from 'mongoose';

const swapperSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true}, // I'm guessing this isn't super safe, so I'll have to encrypt this later... when there is a login logic. For now this should be a simple identifier
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});

const Swapper = mongoose.model('Swapper', swapperSchema);

export default Swapper;