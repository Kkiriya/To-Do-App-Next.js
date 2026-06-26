import { Router, type Response, type Request } from"express";
import prisma from"../../utils/prisma.js";
import axios from "axios";
import { authentifier, exigerRole } from "../middleware/auth.js"
import { pokeapi } from "../api/pokeapi.js";

const routerPokedex = Router();

const TYPES : Record<string, string> = {
    normal :"NORMAL", fire :"FEU", water :"EAU", grass :"PLANTE", electric :"ELECTRIK", ice :"GLACE", fighting :"COMBAT", poison :"POISON",
ground :"SOL", flying :"VOL", psychic :"PSY", bug :"INSECTE", rock :"ROCHE", ghost :"SPECTRE", dragon :"DRAGON", dark :"TENEBRES", steel :"ACIER", fairy :"FEE"
};
 
async function recupererPokemon(nom: any){
    //const reponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nom}/`);
    //if (!reponse.ok) return null
    //const data: any = await reponse.json();
    try{
        const { data } = await pokeapi.get(`/pokemon/${nom}`)

        const hp = data.stats.find((s: any)=> s.stat.name === "hp").base_stat;

        return{
            numeroPokedex: data.id,
            nom: data.name,
            typePrincipal: TYPES[data.types[0].type.name],
            typeSecondaire: data.types[1] ? TYPES[data.types[1].type.name] : null,
            pointsVie: hp,
            taille: data.height,
            poids: data.weight,
            imageUrl: data.sprites.front_default,
        }
    }catch(e){
        if(axios.isAxiosError(e) && e.response){
            console.log("Statut HTTP : ",e.response.status)
        }else{
            console.log("Erreur de reseau ou timeout")
        }
        return null
    }
}

async function getPokemon(nom: any){ // https://pokeapi.co/api/v2/pokemon?limit=5
    const { data } = await pokeapi.get(`/pokemon/${nom}`)
}
// localhost:3000/capturer/pikachu
routerPokedex.post("/capturer/:nom", async(req: Request, res: Response)=>{
    const donnee = await recupererPokemon(req.params.nom)
    if(!donnee) {
        return res.status(404).json({erreur: "Ce Pokemon n'existe pas"})
    }

    try{
        const pokemon = await prisma.pokemon.create({data : donnee as any})
        res.status(201).json({message : `${pokemon.nom} a ete capture !`,pokemon})
    }catch(e){
        res.status(400).json({erreur : "Pokemon deja existant dans la base de donnee"})
    }
})
// localhost:3000/pokedex/1
routerPokedex.patch("/:id",authentifier,exigerRole("ADMIN"), async(req:Request, res: Response)=>{
    const id = Number(req.params.id)

    try{
        const pokemon = await prisma.pokemon.update({
            where : { id },
            data : req.body,
        })
        res.json(pokemon)

    }catch(e){
        res.status(404).json({erreur: `Pokemon ${id} n'existe pas`})
    }
})

// localhost:3000/ select * from pokemon order by numeroPokedex
routerPokedex.get("/", async(req: Request, res: Response)=>{
    const pokemons = await prisma.pokemon.findMany({
        orderBy : { numeroPokedex : "asc" }
    });
    res.json(pokemons)
})

routerPokedex.get("/api", async(req: Request, res: Response)=>{
    //const limite = Number(req.query.limit) || 20

    //const pokemons = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limite}`)
    const { data } = await pokeapi.get("/pokemon", { params: { limit: 20 } })
    //const data : any = await pokemons.json()
    //const pokemonsDetail = await data.results.map((u : any) => fetch(u.url))
    
    res.json(data.results)
})



export default routerPokedex;