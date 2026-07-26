import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getVotes, updateVotes,
  getTierList, updateTierList,
  getHistory, updateHistory,
} from "../controllers/userData.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/votes", getVotes);
router.put("/votes", updateVotes);
router.get("/tierlist", getTierList);
router.put("/tierlist", updateTierList);
router.get("/history", getHistory);
router.put("/history", updateHistory);

export default router;
