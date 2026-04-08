export function validateSwapInput (req, res, next) {
    const {name, email, password, itemName, itemDescription} = req.body;

    if (!name || !email || !password || !itemName || !itemDescription) {
        return res.status(400).json({message: "Please fill in all fields."});
    }

    next();
}