import {createAndAssignItem, findItem, updateItemDesc, updateItemName, deleteItem} from "../services/itemServices.js";
import {findSwapperById, findSwapperByMail, createSwapper, getSwapperItems} from "../services/swapperServices.js";
import {compareHash, hashPassword} from "../utils/passwordHasher.js";
import {deleteImage, updateImageArray} from "../services/imageServices.js";

export async function wannaSwap(req, res) {
    try {
        const {name, email, password, itemName, itemDescription, video} = req.body;
        const images = req.files;
        const swapperExists = await findSwapperByMail(email);

        //this is incredibly stupid, because this will create a new swapper everytime someone types in their email wrong
        //will be updated as soon as "account" functionality has been added

        if (swapperExists) {
            if (!await compareHash(password, swapperExists.password)) {
                return res.status(401)
                            .send( "Incorrect Password.");
            }

            const itemExists = await findItem(itemName, swapperExists)

            if (itemExists) {
                return res.status(409)
                            .send("You already suggested this item.");
            }

            await createAndAssignItem(itemName, itemDescription, images, video, swapperExists);

        } else {
            const newSwapper = await createSwapper(name, email, password);
            await createAndAssignItem(itemName, itemDescription, images, video, newSwapper);
        }

        res.status(200)
            .send("Thank you for your swap! I bet it'll be awesome!");

    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Something went wrong. Please try again.");
    }
}

export async function renderUpdateSwap(req, res) {
    const {email} = req.body;

    try {
        const swapper = await findSwapperByMail(email);
        console.log(swapper);
        const items = await getSwapperItems(swapper);

        res.status(200)
            .render("update-swap", {
                items: items,
                swapper: swapper
            });

    } catch (err) {
        console.log(err);
        res.status(500)
            .json({message: "Something went wrong. Please try again."});
    }
}

export async function updateSwap(req, res) {
    const {swapperID, itemDescription, itemName} = req.body;
    const imageInput = req.files
    const slug = req.params.slug;

    try{
        const swapper = await findSwapperById(swapperID);
        const ID = swapper._id;

        if (itemDescription) {
            await updateItemDesc(slug, ID, itemDescription);
        }

        if (itemName) {
            await updateItemName(slug, ID, itemName);
        }

        if (imageInput) {
            const item = await findItem(itemName, swapper);
            await updateImageArray(item._id, imageInput, swapperID);
        }

        res.status(200)
            .json({message: "Your Swap has been updated."});

    } catch (err) {
        console.log(err);
        res.status(500)
            .json({message: "Something went wrong. Please try again."});
    }
}

export async function deleteSwapItem(req, res) {
    const {itemName, swapperID} = req.body;

    try {
        const swapper = await findSwapperById(swapperID);
        const ID = swapper._id;
        const imageIdArray = swapper.images;

        for (let i = 0; i < imageIdArray.length; i++) {
            await deleteImage(imageIdArray[i]);
        }

        await deleteItem(itemName, ID);

        res.status(200)
            .json({message: "Very well. Your item has been deleted."});
    } catch (err) {
        console.log(err);
        res.status(500)
            .json({message: "Something went wrong. Please try again."});
    }

}