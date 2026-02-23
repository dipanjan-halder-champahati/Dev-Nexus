import express from "express";
import { runCode } from "../controllers/codeController.js";

const router = express.Router();

// POST /api/run-code — execute code via sandboxed Piston API
router.post("/", runCode);

export default router;
