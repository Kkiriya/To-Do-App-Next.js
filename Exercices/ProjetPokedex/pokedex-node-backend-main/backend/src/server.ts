import express from "express"
import dotenv from "dotenv"
import routerPokedex from "./routes/pokedex.routes.js"
import routerAuth from "./routes/auth.routes.js"
dotenv.config()

const app = express()
app.use(express.json())

// localhost:3000/pokedex/.....
app.use("/auth",routerAuth)
app.use("/pokedex",routerPokedex);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Serveur sur le http://localhost:${PORT}/`)
})