import Swapper from "../models/Swapper.js";
import {hashPassword} from "../utils/passwordHasher.js";


export async function findSwapperById (swapperID) {
    return await Swapper.findById(swapperID).exec();
}

export async function findSwapperByMail (email) {
    return await Swapper.findOne({email:email}).exec();
}

export async function createSwapper (name, email, password){
    const passwordHash = await hashPassword(password);

    const swapper = new Swapper({
        name: name,
        email: email,
        password: passwordHash
    });
    await swapper.save();
    return swapper;
}

export async function deleteSwapper(email, password) {
    await Swapper.findOneAndDelete({
        email: email,
        password: password
    });
}

export const deleteSwapperById = async (id) => {
    await Swapper.findByIdAndDelete(id);
};



//Get Item array assigned to swapper
export async function getSwapperItems(swapper) {
    const findSwapper = await Swapper.findOne({
        email: swapper.email,
        password: swapper.password
    })
        .populate("items")
        .exec();

    if (!findSwapper) throw new Error("Swapper not found");
    if (findSwapper.items.length === 0) return [];
    return findSwapper.items;
}