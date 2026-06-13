import { Router, type IRouter } from "express";
import healthRouter from "./health";
import riskRouter from "./risk";
import weatherRouter from "./weather";
import alertsRouter from "./alerts";
import statisticsRouter from "./statistics";
import mapDataRouter from "./mapData";

const router: IRouter = Router();

router.use(healthRouter);
router.use(riskRouter);
router.use(weatherRouter);
router.use(alertsRouter);
router.use(statisticsRouter);
router.use(mapDataRouter);

export default router;
