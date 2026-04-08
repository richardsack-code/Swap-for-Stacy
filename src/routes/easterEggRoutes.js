import express from "express";
import {getEasterEgg, sendEasterEgg} from "../controllers/easterEggController.js";

const easterEggRouter = express.Router();

easterEggRouter.get("/utapau", getEasterEgg);
easterEggRouter.post("/utapau", sendEasterEgg);

export {easterEggRouter};