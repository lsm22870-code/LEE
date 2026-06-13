import { Router } from "express";
import { db } from "@workspace/db";
import { districtRiskTable } from "@workspace/db";

const router = Router();

router.get("/map/districts", async (req, res) => {
  try {
    const districts = await db.select().from(districtRiskTable);
    res.json(
      districts.map((d) => ({
        name: d.name,
        lat: d.lat,
        lng: d.lng,
        score: d.score,
        riskLevel: d.riskLevel,
        mainFireType: d.mainFireType,
        hasTraditionalMarket: d.hasTraditionalMarket ?? false,
        hasForestArea: d.hasForestArea ?? false,
        hasOldBuildings: d.hasOldBuildings ?? false,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get map districts");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;
