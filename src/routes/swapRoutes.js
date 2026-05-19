import express from "express";
import {wannaSwap, updateSwap, deleteSwapItem, renderUpdateSwap} from "../controllers/swapController.js";
import {validateSwapInput} from "../middlewares/validateSwapInput.js";
import {upload} from "../utils/upload.js";

const swapRouter = express.Router();
const renderUpdateSwapRouter = express.Router();
const updateSwapRouter = express.Router();
const deleteSwapRouter = express.Router();

swapRouter.post("/wanna-swap", (req, res, next) => {
    console.log('Multer middleware called for /wanna-swap');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    next();
}, upload.array("imageInput"), (req, res, next) => {
    console.log('After upload.array, req.files:', req.files);
    next();
}, validateSwapInput, wannaSwap);
renderUpdateSwapRouter.post("/update-swap", renderUpdateSwap);
updateSwapRouter.post("/update-swap/:slug", upload.array("imageInput"), updateSwap);
deleteSwapRouter.post("/update-swap/delete", deleteSwapItem);



export {swapRouter, renderUpdateSwapRouter, updateSwapRouter, deleteSwapRouter};