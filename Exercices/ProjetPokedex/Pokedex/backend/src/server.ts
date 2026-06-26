import express from "express";
import dotenv from "dotenv";
import routerPokedex from "./routes/pokedex.route.js";
import prisma from "../utils/prisma.js";

dotenv.config();

const app = express();
app.use(express.json());

// localhost:3000.pokedex/....
app.use("/pokedex", routerPokedex);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancer sur: http://localhost:${PORT}/`);
});
