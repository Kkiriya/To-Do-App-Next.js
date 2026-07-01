# INSTALLATION STEPS FOR NODE.JS PROJECT

## 1. Initialize TypeScript project

```bash
mkdir app
cd app
npm init -y
```

Create `/.gitignore`

```.gitignore
node_modules/
.env
generated/
dist/
```

Create repo structure

```bash
mkdir -p src/{middlewares,routes,utils} && touch src/server.ts src/middlewares/auth.ts src/routes/auth.routes.ts src/utils/prisma.ts
```

## 2. Install dependencies

```bash
# Production
npm install express dotenv @prisma/client @prisma/adapter-neon axios bcryptjs jsonwebtoken

# Developpement
npm install --save-dev typescript tsx prisma @types/node @types/express @types/bcryptjs @types/jsonwebtoken
```

| Paquets                 | Roles                                    |
| ----------------------- | ---------------------------------------- |
| express                 | API REST                                 |
| @prisma/client + prisma | ORM (request + migration)                |
| @prisma/adapter-neon    | connect prisma to neon                   |
| axios                   | consumme API's                           |
| bcryptjs                | hash password (without native compiling) |
| jsonwebtoken            | sign / verify JWT                        |
| dotenv                  | load .env                                |
| tsx                     | execute TypeScript (dev script)          |

## 3. Configure TypeScript and scripts

```bash
npx tsc  --init
```

Then in `/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

Add scripts in `/package.json`

```json
"scripts": {
    "dev": "tsx watch src/server.ts"
}
```

## 4. Neon + .env variables

On `neon.tech` create a project (DB) and copy connexion chaine, at the projects root create: `.env.`

```.env
DATABASE_URL="postgresql://utilisateur:motdepasse@hote.neon.tech/nomdb?sslmode=require"
JWT_SECRET="changez_moi_par_une_longue_chaine_aleatoire"
SPACE_API="https://lldev.thespacedevs.com/2.2.0"
PORT=3000
```

_`SPACE_API` is not required replace with whatever api the current project use, or ommit if not needed_

Generate a good **JWT** secret with:

```bash
SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"); if [ -f .env ] && grep -q "^JWT_SECRET=" .env; then sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$SECRET/" .env; else echo "JWT_SECRET=$SECRET" >> .env; fi
```

Initialize prisma

```bash
npx prisma init
```

## 5. Prisma Schema (models, enums, relations)

Replace all of `prisma/schema.prisma` with the projects models

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ---------- ENUMS ----------
enum Role {
  USER
  ADMIN
}

enum Statut {
  A_VENIR
  SUCCES
  ECHEC
  REPORTE
}

// ---------- MODELES ----------
model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  pseudo       String
  password     String // HASH bcrypt
  role         Role          @default(USER)
  createdAt    DateTime      @default(now())
  suivis       Suivi[]
  commentaires Commentaire[]
}

model Lancement {
  id            Int           @id @default(autoincrement())
  ref           String        @unique // id externe -> anti-doublon
  nom           String
  agence        String?
  fusee         String?
  mission       String?
  lieu          String?
  imageUrl      String?
  dateLancement DateTime?
  statut        Statut        @default(A_VENIR)
  createdAt     DateTime      @default(now())
  suivis        Suivi[]
  commentaires  Commentaire[]
}

// Liste de suivi : un User <-> un Lancement (N-N enrichie)
model Suivi {
  id          Int       @id @default(autoincrement())
  rappel      Boolean   @default(false)
  userId      Int
  lancementId Int
  user        User      @relation(fields: [userId], references: [id])
  lancement   Lancement @relation(fields: [lancementId], references: [id])

  @@unique([userId, lancementId])
}

model Commentaire {
  id          Int       @id @default(autoincrement())
  contenu     String
  createdAt   DateTime  @default(now())
  userId      Int
  lancementId Int
  user        User      @relation(fields: [userId], references: [id])
  lancement   Lancement @relation(fields: [lancementId], references: [id])
}
```

_Every model will change based on the projects needs however the Role enum is almost always neccessary! (especially if using auth)_

_`Lancement.ref` is @unique: its the Id for the external API it prevents importing the same one twice on the same launch_

## 6. Migration + Prisma client (singleton)

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Create singleton in `src/utils/prisma.ts`

```ts
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../generated/prisma/client.js"; // here add .js to remove compiling errors
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});

export default prisma;
```

_The import comes from `../../generated/prisma/client` no from `@prisma/client`_

_in `package.json` change `"type": "commonjs"` to `"type": "module"` to get rid of errors_

## 7. Minimal Express server

Create `src/server.ts`

```ts
import express, { type Request, type Response } from "express"; // here we add type to avoid compiler errors
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
res.json({ message: "LaunchPad - Mission Control" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(‘Serveur sur http://localhost:${PORT}‘));
```

Add to `.env`

```.env
PORT=3000
```

Run

```bash
npm run dev
```

_Terminal should show `Serveur sur http://localhost:3000`_

## 8. Security - middlewares JWT

Create `src/middlewares/auth.ts`

```ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JwtPayload = { sub: number; role: "USER" | "ADMIN" };

// Verifie le token et attache l’utilisateur a req.user
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
      return res.status(403).json({ erreur: "Acces refuse" });
    }
    next();
  };
}
```

_401 vs 403: 401 => "Je ne sais pas qui tu es"; 403 => "je sais, mais tu n'as pas le droit"_

## 9. Authentification (register / login / me)

create `src/routes/auth.routes/ts`

```ts
import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";
import { authentifier } from "../middlewares/auth.js";

const router = Router();

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, pseudo, password } = req.body;
  if (!email || !pseudo || !password) {
    return res.status(400).json({ erreur: "email, pseudo et password requis" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, pseudo, password: hash },
    });
    res
      .status(201)
      .json({ id: user.id, email: user.email, pseudo: user.pseudo });
  } catch {
    res.status(400).json({ erreur: "Email deja utilise" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ erreur: "Identifiants invalides" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ erreur: "Identifiants invalide" });
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "2h" },
  );
  res.json({ token });
});

// Get /auth/me (route protege)
router.get("/me", authentifier, async (req: Request, res: Response) => {
  const id = (req as any).user.sub;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      pseudo: true,
      role: true,
      createdAt: true,
    },
  });
  res.json(user);
});

export default router;
```

_We use select to never return the password, same reason the error message stays generic_
