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
