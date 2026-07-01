import { Router, type Request, type Response } from "express";
import prisma from "../utils/prisma.js";
import { authentifier, exigerRole } from "../middlewares/auth.js";
import { stat } from "node:fs";

const router = Router();

// GET /lancements?statut=A_VENIR&page=1&limit=10 (public, filtre + pagine)
router.get("/", async (req: Request, res: Response) => {
  const { statut } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  const where = statut ? { statut: String(statut) as any } : {};
  const [lancements, total] = await Promise.all([
    prisma.lancement.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { dateLancement: "asc" },
    }),
    prisma.lancement.count({ where }),
  ]);
  res.json({ page, limit, total, lancements });
});

// GET /lancements/:id (public)
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const lancement = await prisma.lancement.findUnique({ where: { id } });
  if (!lancement)
    return res.status(404).json({ erreur: "Lancement introuvable" });
  res.json(lancement);
});

// POST /lancements (ADMIN: creation manuelle)
router.post(
  "/",
  authentifier,
  exigerRole("ADMIN"),
  async (req: Request, res: Response) => {
    const { ref, nom, agence, fusee } = req.body;
    if (!ref || !nom)
      return res.status(400).json({ erreur: "ref et nom requis" });
    const lancement = await prisma.lancement.create({
      data: { ref, nom, agence, fusee },
    });
    res.status(201).json(lancement);
  },
);

// PATCH /lancement/:id (ADMIN)
router.patch(
  "/:id",
  authentifier,
  exigerRole("ADMIN"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const lancement = await prisma.lancement.update({
        where: { id },
        data: req.body,
      });
      res.json(lancement);
    } catch {
      res.status(404).json({ erreur: "Lancement introuvable" });
    }
  },
);

// DELETE /lancement/:id (ADMIN)
router.delete(
  "/:id",
  authentifier,
  exigerRole("ADMIN"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      await prisma.lancement.delete({ where: { id } });
      res.status(204).end();
    } catch {
      res.status(404).json({ erreur: "Lancement introuvable" });
    }
  },
);

export default router;
