import express from "express";
import { importAllData } from "../controllers/data.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rateLimiter.middleware.js";

const dataRouter = express.Router();

dataRouter.post("/import", authorize, apiLimiter, importAllData);

export default dataRouter;
