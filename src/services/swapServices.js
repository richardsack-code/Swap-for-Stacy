import Swapper from "../models/Swapper.js";
import Item from "../models/Item.js";

export async function findItem(itemName, swapper) {
    return await Item.findOne({name: itemName, swapper: swapper}).exec();
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