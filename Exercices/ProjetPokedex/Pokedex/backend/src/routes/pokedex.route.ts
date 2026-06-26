import { Router, type Response, type Request, response } from "express";
import prisma from "../../utils/prisma.js";

const routerPokedex = Router();

const TYPES: Record<string, string> = {
  normal: "NORMAL",
  fire: "FEU",
  water: "EAU",
  grass: "PLANTE",
  electric: "ELECTRIK",
  ice: "GLACE",
  fighting: "COMBAT",
  poison: "POISON",
  ground: "SOL",
  flying: "VOL",
  psychic: "PSY",
  bug: "INSECTE",
  rock: "ROCHE",
  ghost: "SPECTRE",
  dragon: "DRAGON",
  dark: "TENEBRES",
  steel: "ACIER",
  fairy: "FEE",
};

async function recupererPokemon(nom: any) {
  const reponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nom}/`);

  if (!reponse.ok) return null;

  const data: any = await reponse.json();

  const hp = data.stats.find((s: any) => s.stat.name === "hp").base_stat;

  return {
    numeroPokedex: data.id,
    nom: data.name,
    typePrincipal: TYPES[data.types[0].type.name],
    typeSecondaire: data.types[1] ? TYPES[data.types[1].type.name] : null,
    pointsVie: hp,
    taile: data.height,
    poids: data.weight,
    imageUrl: data.sprites.front_default,
  };
}

// localhost:3000/captuer/pikachu --> ajoute le pokemon rechercher dans la base de donnees
routerPokedex.post("/capturer/:nom", async (req: Request, res: Response) => {
  const data = await recupererPokemon(req.params.nom);
  if (!data) res.status(404).json({ erreur: "Ce pokemon n'existe pas!" });

  try {
    const pokemon = await prisma.pokemon.create({ data: data as any });
    res
      .status(201)
      .json({ message: `${pokemon.nom} a ete capturer!`, pokemon });
  } catch (e) {
    res
      .status(400)
      .json({ erreur: "Pokemon existe deja dans la base de donnees" });
  }
});

// localhost:3000/ select * from pokemon order by
routerPokedex.get("/", async (req: Request, res: Response) => {
  const pokemons = await prisma.pokemon.findMany({
    orderBy: { numeroPokedex: "asc" },
  });
  res.json(pokemons);
});
routerPokedex.get("/api", async (req: Request, res: Response) => {
  const limite = Number(req.query.limit) || 20;
  const pokemons = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limite}`,
  );
  const data: any = await pokemons.json();
  const pokemonsDetail = await data.results.map((u: any) => fetch(u.url));
  res.json(data.results);
});

export default routerPokedex;
