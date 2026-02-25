import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { saveNote, getNote } from "../controllers/notesController.js";

const router = express.Router();

router.post("/save", protectRoute, saveNote);
router.get("/:sessionId", protectRoute, getNote);

export default router;
