import { Router } from "express";
import { getStatistics } from "../controllers/statisticsController";

const router = Router();

router.get('/statistics', getStatistics);

export default router;
