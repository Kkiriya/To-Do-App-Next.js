import { Router, type Request, type Response } from "express";
import prisma from "../utils/prisma.js";
import { authentifier } from "../middlewares/auth.js";

const router = Router();

// GET /lancements/:id/commentaires (public)
router.get(
  "/lancements/:id/commentaires",
  async (req: Request, res: Response) => {
    const lancementId = Number(req.params.id);
    const commentaires = await prisma.commentaire.findMany({
      where: { lancementId },
      include: { user: { select: { pseudo: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(commentaires);
  },
);

// POST /lancements/:id/commentaires body: { "contenue": "..." } (connecte)
router.post(
  "/lancements/:id/commentaires",
  authentifier,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.sub;
    const lancementId = Number(req.params.id);
    const { contenu } = req.body;
    if (!contenu) return res.status(400).json({ erreur: "contenue requis" });
    const commentaire = await prisma.commentaire.create({
      data: { contenu, userId, lancementId },
    });
    res.status(201).json(commentaire);
  },
);

// DELETE /commentaires/:id -> l'auteur OU un ADMIN peut supprimer
router.delete(
  "/commentaires/:id",
  authentifier,
  async (req: Request, res: Response) => {
    const user = (req as any).user; // { sub, role }
    const id = Number(req.params.id);
    const commentaire = await prisma.commentaire.findUnique({ where: { id } });
    if (!commentaire)
      return res.status(404).json({ erreur: "commentaire introuvable" });

    const estAuteur = commentaire.userId === user.sub;
    const estAdmin = user.role === "ADMIN";
    if (!estAuteur && !estAdmin) {
      return res.status(403).json({ erreur: "Action non autorisee" });
    }
    await prisma.commentaire.delete({ where: { id } });
    res.status(204).end();
  },
);

export default router;
