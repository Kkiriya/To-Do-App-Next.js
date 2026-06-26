import { Router,type Request,type Response } from 'express'

import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma.js'
import jwt from 'jsonwebtoken'

const routerAuth = Router()

// POST localhost:3000/auth/register -> Cree un compte 
routerAuth.post("/register",async (req:Request, res: Response)=>{
    const {email , password} = req.body
    if(!email || !password){
        return res.status(400).json({erreur: "mail ou mot de passe manquant !"})
    }

    try{
        const pass_hash = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({data : {email, password: pass_hash}})
        // JAMAIIIIIIIIIS DE HASH RETOURNER (ET SURTOUT JAMAIIIIIS LE PASSWORD)
        res.status(201).json({id: user.id, email: user.email, role: user.role, createdAt: user.createdAt})

    }catch{
        res.status(400).json({erreur : "Email existe deja !"})

    }
})

// POST localhost: 3000/auth/login -> Se connecter 
routerAuth.post("/login",async(req:Request, res:Response)=>{
    const {email, password} = req.body 
    const user = await prisma.user.findUnique({ where : {email}})

    if(!user) return res.status(401).json({erreur: "Identifiant invalides "})
    const ok = await bcrypt.compare(password, user.password)
    if(!ok) return res.status(401).json({erreur : "Mot de passe incorrect "})

    const token = jwt.sign(
        {sub: user.id, role: user.role},
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    )
    res.json({token})
})

export default routerAuth