import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getEasterEgg(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'utapau.html'));
}

export function sendEasterEgg(req, res) {
    if(/general kenobi/i.test(req.body.retort)) {
        res.send("How uncivilized.");
    } else {
        res.send("...go watch Star Wars...");
    }
}