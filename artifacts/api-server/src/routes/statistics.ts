import { Router } from "express";
import { db } from "@workspace/db";
import { monthlyStatTable, hourlyStatTable, fireCauseStatTable, seasonalStatTable } from "@workspace/db";

const router = Router();

router.get("/statistics/monthly", async (req, res) => {
  try {
    const stats = await db.select().from(monthlyStatTable).orderBy(monthlyStatTable.month);
    res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get monthly statistics");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

router.get("/statistics/hourly", async (req, res) => {
  try {
    const stats = await db.select().from(hourlyStatTable).orderBy(hourlyStatTable.hour);
    res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get hourly statistics");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

router.get("/statistics/causes", async (req, res) => {
  try {
    const stats = await db.select().from(fireCauseStatTable).orderBy(fireCauseStatTable.count);
    res.json(stats.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to get fire cause statistics");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

router.get("/statistics/seasonal", async (req, res) => {
  try {
    const stats = await db.select().from(seasonalStatTable);
    res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get seasonal statistics");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;
