import { Router } from "express";
import { db } from "@workspace/db";
import { alertMessageTable } from "@workspace/db";
import { or, eq } from "drizzle-orm";

const router = Router();

router.get("/alerts/today", async (req, res) => {
  try {
    const userType = (req.query.userType as string) ?? "citizen";
    const targetTypes: Array<"citizen" | "firefighter" | "all"> =
      userType === "firefighter" ? ["firefighter", "all"] : ["citizen", "all"];

    const alerts = await db
      .select()
      .from(alertMessageTable)
      .where(
        or(
          ...targetTypes.map((t) => eq(alertMessageTable.targetAudience, t))
        )
      )
      .orderBy(alertMessageTable.createdAt);

    res.json(
      alerts.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        severity: a.severity,
        category: a.category,
        targetAudience: a.targetAudience,
        timeRange: a.timeRange ?? "",
        district: a.district ?? null,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get today alerts");
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

export default router;
