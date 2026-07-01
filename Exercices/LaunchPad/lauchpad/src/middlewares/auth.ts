import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JwtPayload = { sub: number; role: "USER" | "ADMIN" };

// Verifie le token et attache l'utilisateur a req.user
export function authentifier(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization; // "Bearer xxx.yyy.zzz"
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ erreur: "Token manquant" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ erreur: "Token invalide ou expire" });
  }
}

// Exige un role (a brancher APRES authentifier)
export function exigerRole(role: "ADMIN" | "USER") {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.role !== role) {
      return res.status(403).json({ erreur: "Access refuse" });
    }
    next();
  };
}
