import express from "express";

import { getDashboardOverview } from "../controllers/dashboardcontroller.js";

import protect from "../middleware/auth.js";
const dashboardRouter = express.Router();

dashboardRouter.get("/", protect, getDashboardOverview);

export default dashboardRouter;