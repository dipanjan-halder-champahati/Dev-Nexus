import express from "express";
import { reviewCode } from "../controllers/aiReviewController.js";

const router = express.Router();
router.post("/", reviewCode);

export default router;
