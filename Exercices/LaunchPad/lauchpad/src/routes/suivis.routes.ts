import { Router, type Request, type Response } from "express";
import prisma from "../utils/prisma.js";
import { authentifier } from "../middlewares/auth.js";

const router = Router();
router.use(authentifier); // TOUT ce router exige d'etre connecte

// GET /mes-suivis -> les lancements suivis par l'utilisateur connecte
router.get("/", async (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const suivis = await prisma.suivi.findMany({
    where: { userId },
    include: { lancement: true },
    orderBy: { id: "desc" },
  });
  res.json(suivis);
});

// POST /mes-suivis body: {"lancementId": 1, "rappel": true }
router.post("/", async (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const { lancementId, rappel } = req.body;
  try {
    const suivi = await prisma.suivi.create({
      data: { userId, lancementId: Number(lancementId), rappel: !!rappel },
    });
    res.status(201).json(suivi);
  } catch {
    res.status(400).json({ erreur: "Lancement deha suivi (ou inexistant)" });
  }
});

// PATCH /mes-suivis/:id -> activer/desactiver le rappel (propriete verifiee)
router.patch("/:id", async (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const id = Number(req.params.id);
  const suivi = await prisma.suivi.findUnique({ where: { id } });
  if (!suivi) return res.status(404).json({ erreur: "Suivi introuvable" });
  if (suivi.userId !== userId) {
    return res.status(403).json({ erreur: "Ce n'est pas votre suivi" });
  }
  const maj = await prisma.suivi.update({
    where: { id },
    data: { rappel: !!req.body.rappel },
  });
  res.json(maj);
});

// DELETE /mes-suivis/:id (propriete verifiee)
router.delete("/:id", async (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const id = Number(req.params.id);
  const suivi = await prisma.suivi.findUnique({ where: { id } });
  if (!suivi) return res.status(404).json({ erreur: "Suivi introuvable" });
  if (suivi.userId !== userId) {
    return res.status(403).json({ erreur: "Ce n'est pas votre suivi" });
  }
  await prisma.suivi.delete({ where: { id } });
  res.status(204).end();
});

export default router;
