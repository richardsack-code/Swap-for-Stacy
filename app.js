import express from 'express';
import { logger } from './src/middlewares/logger.js';
import connectDB from './src/config/db.js';
import {swapRouter, renderUpdateSwapRouter, updateSwapRouter, deleteSwapRouter} from "./src/routes/swapRoutes.js";
import {easterEggRouter} from "./src/routes/easterEggRoutes.js";

//this part I got from AI
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;


const staticPages = ["/index.html", "/wanna-swap.html", "/current-best-bidding.html", "/swap-history.html", "/utapau.html"];


// --- MIDDLEWARE ---
app.use(logger);
connectDB();

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// --- MIDDLEWARE ---





// --- ROUTING ---

app.get( "/", (req, res) => {
    const itemName = "item name";
    res.render('index', {
        itemName: itemName
    });
});

/*
app.get('/utapau', (req, res) => {
    //Easter egg
    res.sendFile(path.join(__dirname, 'public', 'utapau.html'));
});

app.post("/utapau", (req, res) => {
    //Easter egg
    if(/general kenobi/i.test(req.body.retort)) {
        res.send("How uncivilized.");
    } else {
        res.send("...go watch Star Wars...");
    }
});
*/

app.use(easterEggRouter);

app.get('/:slug', (req, res) => {
    //later: send static page, depending on slug

    const reqURL = req.params.slug;

    if (!staticPages.includes(`/${reqURL}`)) {
        res.send(`Sorry, a "${reqURL}" page does not exist here.`);
        return;
    }
});


/*app.post('/wanna-swap', async (req, res) => {
    //later: post swap proposal to databank. safe email as identifier and password as auth confirmation without creating an "account"

    //this really isn't pretty. cleaning up logic for next hand-in

    if (!req.body.name || !req.body.email || !req.body.password || !req.body.itemName || !req.body.itemDescription) {
        res.send("Please fill in all fields.");
        return;
    }

    try {
        const swapperMail = req.body.email;
        const itemName = req.body.itemName;
        const swapperExists = await Swapper.findOne({email: swapperMail}).exec();

        if (swapperExists) {
            if (req.body.password !== swapperExists.password) {
                res.send("Incorrect password.");
                return;
            }

            const itemExists = await Item.findOne({name: itemName, swapper: swapperExists}).exec();

            if (itemExists) {
                res.send("You already suggested this item.");
                // later: add redirect to update swap proposal or option to resuggest
            } else {
                const item = new Item({
                    name: req.body.itemName,
                    description: req.body.itemDescription,
                    images: req.body.images, //multer implementation for image uploads coming soon
                    video: req.body.video,
                    swapper: swapperExists
                });

                await Swapper.findOneAndUpdate({email: swapperExists.email}, {$push: {items: item}});

                item.save()
                    .then(() => res.send("Thank you for your swap! I bet it'll be awesome!"));
            }

        } else {
            const swapper = new Swapper({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            const item = new Item({
                name: req.body.itemName,
                description: req.body.itemDescription,
                images: req.body.images, //multer implementation for image uploads coming soon
                video: req.body.video,
                swapper: swapper
            });


            await swapper.save();
            await Swapper.findOneAndUpdate({email: swapper.email}, {$push: {items: item}});

            item.save()
                .then(() => res.send("Thank you for your swap! I bet it'll be awesome!"));
        }
    } catch (err) {
        console.log(err);
        res.send("Something went wrong. Please try again.");
    }

});
 */

app.use(swapRouter);

/*
app.post("/update-swap", async (req, res) => {
    try {
        const swapperMail = req.body.email;
        const swapperPassword = req.body.password;

        const swapper = await Swapper.findOne({email: swapperMail, password: swapperPassword})
            .populate("items")
            .exec();
        const items = swapper.items;

        res.render('update-swap', {
            items: items,
            swapper: swapper
        });

    } catch (err) {
        console.log(err);
        res.send("Something went wrong. Please try again.")
    }
});
 */

app.use(renderUpdateSwapRouter);

/*
app.post("/update-swap/delete" , async (req, res) => {
    const item = req.body.itemName;
    const swapper = await Swapper.findById(req.body.swapperID);
    const swapperID = swapper._id;

    await Item.findOneAndDelete({
        swapper: swapperID,
        name: item
    });

    res.send("Very well. Your item has been deleted.");

});
 */

app.use(deleteSwapRouter);

/*
app.post("/update-swap/:slug" , async (req, res) => {
    const slug = req.params.slug;
    const swapper = await Swapper.findById(req.body.swapperID);
    const newDesc = req.body.itemDescription;
    const newName = req.body.itemName;
    const swapperID= swapper._id;

    try {
        if (newDesc && newName) {
            await Item.findOneAndUpdate({
                name: slug,
                swapper: swapperID
            }, {description: newDesc, name: newName});
        } else if (newDesc) {
            await Item.findOneAndUpdate({
                name: slug,
                swapper: swapperID
            }, {description: newDesc});
        } else if (newName) {
            await Item.findOneAndUpdate({
                name: slug,
                swapper: swapperID
            }, {name: newName});
        }

        res.send("Your item has been updated!");
    } catch (err){
        console.log(err);
        res.send("Something went wrong. Please try again.")
    }


});
 */

app.use(updateSwapRouter);


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

// --- ROUTING ---