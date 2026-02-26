import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
  saveCode,
  changeProblem,
  updateProblemList,
} from "../controllers/sessionController.js";
import { recordFocusEvent } from "../controllers/focusController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);
router.post("/:id/save-code", protectRoute, saveCode);
router.post("/:id/focus-event", protectRoute, recordFocusEvent);
router.post("/:id/change-problem", protectRoute, changeProblem);
router.post("/:id/update-problem-list", protectRoute, updateProblemList);

export default router;