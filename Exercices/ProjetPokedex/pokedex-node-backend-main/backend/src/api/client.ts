import axios from 'axios'
import { pokeapi } from './pokeapi.js'

export const api = axios.create({
    baseURL: "http://localhost:3000",
    timeout:5000
})

async function demo(){
    // GET : combien de pokemon dans le pokedex 
    const { data : pokedex } = await api.get("/pokedex")
    console.log("Pokedex : ", pokedex.length," Pokemons.") 


    // POST : Ajouter un pokemon a partir de PokeAPI
    // POST http://localhost:3000/
    const { data: capture } = await api.post("/pokedex/capturer/kakuna")
    console.log("Pokemon : ",capture.message)

    const id = capture.pokemon.id

    // PATCH : Ameliorer notre pokemon !
    const { data : maj } = await api.patch(`/pokedex/${id}`, { rarete :"LEGENDAIRE"})
    console.log("Nouvelle rarete : ", maj.rarete)
    
}
demo().catch((e) =>{
    if(axios.isAxiosError(e)){
        console.log("Erreur API :", e.response?.status, e.response?.data)
    }else{
        console.log("Erreur : ",e)
    }
})