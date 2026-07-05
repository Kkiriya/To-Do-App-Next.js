import { Router, type Request, type Response } from "express";
import prisma from "../utils/prisma.js";
import { authentifier, exigerRole } from "../middlewares/auth.js";
import { stat } from "node:fs";
import axios from "axios";
import { spaceDevs } from "../api/spaceDevs.js";

const router = Router();

// POST /lancement/importer body: { "limite": 5 }
// -> recupere les prochains lancement REELS et les enregistre (sans doublons)
router.post("/importer", authentifier, async (req: Request, res: Response) => {
  const limite = Math.min(10, Number(req.body.limite) || 5);
  try {
    // 1) Appel API publique via Axios
    const { data } = await spaceDevs.get("/launch/upcoming/", {
      params: { limit: limite },
    });

    // 2) Transformation + 3) ecriture (upsert: creer su nouveau, sinon mettre a jour)
    let importes = 0;
    for (const l of data.results) {
      await prisma.lancement.upsert({
        where: { ref: l.id },
        update: { statut: "A_VENIR" },
        create: {
          ref: l.id,
          nom: l.name,
          agence: l.launch_service_provider?.name ?? null,
          fusee: l.rocket?.configuration?.name ?? null,
          mission: l.mission?.name ?? null,
          imageUrl: l.image ?? null,
          dateLancement: l.net ? new Date(l.net) : null,
          statut: "A_VENIR",
        },
      });
      importes++;
    }
    res
      .status(201)
      .json({ message: `${importes} lancement(s) importe(s)`, importes });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return res
        .status(502)
        .json({ erreur: "API The Space Devs injoignable (ou quota atteint)" });
    }
    res.status(500).json({ erreur: "Errreur lors de l'import" });
  }
});

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
