import express from "express";
import {wannaSwap, updateSwap, deleteSwapItem, renderUpdateSwap} from "../controllers/swapController.js";
import {validateSwapInput} from "../middlewares/validateSwapInput.js";

const swapRouter = express.Router();
const renderUpdateSwapRouter = express.Router();
const updateSwapRouter = express.Router();
const deleteSwapRouter = express.Router();

swapRouter.post("/wanna-swap", validateSwapInput, wannaSwap);
renderUpdateSwapRouter.post("/update-swap", renderUpdateSwap);
updateSwapRouter.post("/update-swap/:slug", updateSwap);
deleteSwapRouter.post("/update-swap/delete", deleteSwapItem);



export {swapRouter, renderUpdateSwapRouter, updateSwapRouter, deleteSwapRouter};