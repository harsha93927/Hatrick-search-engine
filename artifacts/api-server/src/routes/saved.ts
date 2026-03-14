import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, savedItemsTable } from "@workspace/db";
import { SaveItemBody, DeleteSavedItemParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/saved", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(savedItemsTable)
    .orderBy(savedItemsTable.savedAt);

  res.json(
    items.map((item) => ({
      ...item,
      savedAt: item.savedAt.toISOString(),
    }))
  );
});

router.post("/saved", async (req, res): Promise<void> => {
  const parsed = SaveItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(savedItemsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json({
    ...item,
    savedAt: item.savedAt.toISOString(),
  });
});

router.delete("/saved/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSavedItemParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(savedItemsTable)
    .where(eq(savedItemsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Saved item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
