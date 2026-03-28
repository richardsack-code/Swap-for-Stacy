import express from 'express';
import { logger } from './middlewares/logger.js';
import connectDB from './config/db.js';
import Item from './models/Item.js';
import Swapper from './models/Swapper.js';

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


app.get('/:slug', (req, res) => {
    //later: send static page, depending on slug

    const reqURL = req.params.slug;

    if (!staticPages.includes(`/${reqURL}`)) {
        res.send(`Sorry, a "${reqURL}" page does not exist here.`);
        return;
    }
});


app.post('/wanna-swap', async (req, res) => {
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

            const itemExists = await Item.findOne({name: req.body.itemName, swapper: swapperExists}).exec();

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
            item.save()
                .then(() => res.send("Thank you for your swap! I bet it'll be awesome!"));
        }
    } catch (err) {
        console.log(err);
        res.send("Something went wrong. Please try again.");
    }

});


app.delete("/wanna-swap" , (req, res) => {
    //later: delete swap proposal from databank, using email as identifier and password as confirmation requirement
});


app.patch("/wanna-swap", (req, res) => {
   //later: update swap proposal in databank, using email as identifier and password as confirmation requirement
});


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

// --- ROUTING ---