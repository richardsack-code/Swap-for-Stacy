import {createAndAssignItem, findItem, updateItemDesc, updateItemName, deleteItem} from "../services/swapServices.js";
import {findSwapperById, findSwapperByMail, createSwapper, getSwapperItems} from "../services/swapperServices.js";
import {compareHash, hashPassword} from "../utils/passwordHasher.js";

export async function wannaSwap(req, res) {
    try {
        const {name, email, password, itemName, itemDescription, images, video} = req.body;
        const swapperExists = await findSwapperByMail(email);

        //this is incredibly stupid, because this will create a new swapper everytime someone types in their email wrong
        //will be updated as soon as "account" functionality has been added

        if (swapperExists) {
            if (await compareHash(password, swapperExists.password)) {
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
    const slug = req.params.slug;
    //the form sends the name of the item to be changed via URL. Hence, we extract the slug to identify the correct item
    const swapper = await findSwapperById(swapperID);
    const ID = swapper._id;

    try{
        if(itemDescription && itemName) {
            await updateItemName(slug, ID, itemName);
            await updateItemDesc(slug, ID, itemDescription);
        } else if (itemDescription) {
            await updateItemDesc(slug, ID, itemDescription);
        } else if (itemName) {
            console.log(slug, swapperID, itemName);
            await updateItemName(slug, ID, itemName);
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
    const swapper = await findSwapperById(swapperID);
    const ID = swapper._id;

    try {
       await deleteItem(itemName, ID);

        res.status(200)
            .json({message: "Very well. Your item has been deleted."});
    } catch (err) {
        res.status(500)
            .json({message: "Something went wrong. Please try again."});
    }

}