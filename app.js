import express from 'express';
import { logger } from './middlewares/logger.js';

//this part I got from AI
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const staticPages = ["/index.html", "/wanna-swap.html", "/current-best-bidding.html", "/swap-history.html", "/utapau.html"];

// --- PRE ROUTE MIDDLEWARE ---

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

// --- PRE ROUTE MIDDLEWARE ---





// --- ROUTING ---

app.get('/utapau', (req, res) => {
    //easter egg
    res.sendFile(path.join(__dirname, 'public', 'utapau.html'));
});

app.post("/utapau", (req, res) => {
    //easter egg
    if(/general kenobi/i.test(req.body.retort)) {
        res.send("How uncivilized.");
    } else {
        res.send("...go watch Star Wars...");
    }
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
