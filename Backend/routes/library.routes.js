import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getLibraryEntries,
  getLibraryEntry,
  addLibraryEntry,
  updateLibraryEntry,
  deleteLibraryEntry,
  getLibraryStats,
} from "../controllers/library.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getLibraryEntries);
router.get("/stats", getLibraryStats);
router.get("/:gameId", getLibraryEntry);
router.post("/", addLibraryEntry);
router.put("/:id", updateLibraryEntry);
router.delete("/:id", deleteLibraryEntry);

export default router;
