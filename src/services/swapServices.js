import Swapper from "../models/Swapper.js";
import Item from "../models/Item.js";


export async function findSwapper (email, password) {
    return await Swapper.findOne({email: email, password: password}).exec();
}

export async function findSwapperById (swapperID) {
    return await Swapper.findById(swapperID);
}

export async function findSwapperByMail (email) {
    return await Swapper.findOne({email:email}).exec();
}

export async function findItem(itemName, swapper) {
    return await Item.findOne({name: itemName, swapper: swapper}).exec();
}

export async function createSwapper(name, email, password) {
    const swapper = new Swapper({
        name: name,
        email: email,
        password: password
    });
    await swapper.save();
    return swapper;
}

//create a new item and assign it to existing swapper
export async function createAndAssignItem (itemName, itemDescription, images, video, swapper) {
    const item = new Item({
        name: itemName,
        description: itemDescription,
        images: images,
        video: video,
        swapper: swapper
    });

    await Swapper.findOneAndUpdate(
        {email: swapper.email},
        {$push: {items: item}}
    );

    await item.save();

    return item;
}

//Get Item array assigned to swapper
export async function getSwapperItems(swapper) {
    const findSwapper = await Swapper.findOne({email: swapper.email, password: swapper.password})
        .populate("items")
        .exec();
    return findSwapper.items;
}

//Update Item Description
export async function updateItemDesc(itemName, swapperID, itemDesc) {
    await Item.findOneAndUpdate(
        {
            name: itemName,
            swapper: swapperID
        },
        {
            description: itemDesc
        }
    );
}

export async function updateItemName(itemName, swapperID, itemNewName) {
    await Item.findOneAndUpdate(
        {
            name: itemName,
            swapper: swapperID
        },
        {
            name: itemNewName
        }
    );
}

export async function deleteItem(itemName, swapperID) {
     await Item.findOneAndDelete({
        swapper: swapperID,
        name: itemName
    });
}