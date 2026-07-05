import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import lancementsRoutes from "./routes/lancements.routes.js";
import suivisRoutes from "./routes/suivis.routes.js";
import commentairesRoutes from "./routes/commentaires.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "LaunchPad - Mission Control" });
});

app.use("/auth", authRoutes);
app.use("/lancements", lancementsRoutes);
app.use("/mes-suivis", suivisRoutes);
app.use("/", commentairesRoutes); // lancements/:id/commentaires et /commentaires/:id

// 404
app.use((req: Request, res: Response) =>
  res.status(404).json({ erreur: "Route inconnue" }),
);

// gestionnaire d'erreurs global (4 parametres)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ erreur: "Erreur interne du serveur" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
