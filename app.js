import express from 'express';
import { logger } from './middlewares/logger.js';

const app = express();
const PORT = 3000;

const staticPages = ["/index.html", "/wanna-swap.html", "/current-best-bidding.html", "/swap-history"];

// --- PRE ROUTE MIDDLEWARE ---

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

// --- PRE ROUTE MIDDLEWARE ---





// --- ROUTING ---

app.get('/', (req, res) => {
    res.send('Hello there!');
    //send index static page

});


app.get('/:slug', (req, res) => {
    //later: send static page, depending on slug

    const reqURL = req.params.slug;

    if (!(req.url in staticPages)) {
        res.send(`Sorry, a "${reqURL}" page does not exist here.`);
    }
});


app.post('/wanna-swap', (req, res) => {
    //later: post swap proposal to databank. safe email as identifier and password as auth confirmation without creating an "account"

    console.log("Swap proposal: ", req.body);
    res.send("Thank you for your swap! I bet it'll be awesome!");
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



// --- POST ROUTE MIDDLEWARE ---
app.use(logger);

// --- POST ROUTE MIDDLEWARE ---
